/**
 * lib/parsePdf.js
 *
 * Two-pass PDF extractor backed by Claude (claude-sonnet-4-5):
 *   1. Page locator (cheap) — find the page ranges for the requested test.
 *   2. Main extraction — slice the PDF to the relevant pages, send back to
 *      Claude, parse structured JSON.
 *
 * Cost reporting per call.
 *
 * Anthropic SDK accepts PDFs as `document` content blocks (base64 + media_type).
 */

"use strict";

const fs = require("fs");
const Anthropic = require("@anthropic-ai/sdk").default || require("@anthropic-ai/sdk");
const { PDFDocument } = require("pdf-lib");
const { extractionPrompt, pageLocatorPrompt } = require("./extractionPrompt");

// Pricing for claude-sonnet-4-5 (Anthropic public pricing as of 2026-04):
//   $3.00 per 1M input tokens, $15.00 per 1M output tokens
const PRICE_INPUT_PER_MTOK = 3.0;
const PRICE_OUTPUT_PER_MTOK = 15.0;
const MODEL = "claude-sonnet-4-5";

let _client = null;
function getClient() {
  if (_client) return _client;
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY missing in env");
  }
  _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

function priceUsd(usage) {
  const inUsd = ((usage.input_tokens || 0) / 1_000_000) * PRICE_INPUT_PER_MTOK;
  const outUsd = ((usage.output_tokens || 0) / 1_000_000) * PRICE_OUTPUT_PER_MTOK;
  return inUsd + outUsd;
}

/**
 * Strip ```json fences and surrounding whitespace from a model response.
 *
 * @param {string} text
 */
function stripFences(text) {
  if (!text) return text;
  return text
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

/**
 * Slice a PDF to a list of [start, end] (1-indexed inclusive) page ranges.
 * Returns a Buffer of the new PDF.
 *
 * @param {Buffer} srcBuffer
 * @param {Array<[number, number]|null>} ranges
 */
async function slicePdf(srcBuffer, ranges) {
  const src = await PDFDocument.load(srcBuffer);
  const out = await PDFDocument.create();
  const total = src.getPageCount();
  const pageIndices = new Set();
  for (const r of ranges) {
    if (!r) continue;
    const [s, e] = r;
    for (let p = s; p <= e; p++) {
      const idx = p - 1;
      if (idx >= 0 && idx < total) pageIndices.add(idx);
    }
  }
  const sortedIdx = [...pageIndices].sort((a, b) => a - b);
  const copied = await out.copyPages(src, sortedIdx);
  for (const pg of copied) out.addPage(pg);
  return Buffer.from(await out.save());
}

/**
 * @param {Buffer} pdfBuffer
 * @param {string} promptText
 * @param {number} [maxTokens=16000]
 * @returns {Promise<{ text: string, usage: object }>}
 */
async function callClaude(pdfBuffer, promptText, maxTokens = 16000) {
  const client = getClient();
  const b64 = pdfBuffer.toString("base64");
  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: b64 },
          },
          { type: "text", text: promptText },
        ],
      },
    ],
  });
  const text = (resp.content || [])
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("");
  return { text, usage: resp.usage || {} };
}

/**
 * @param {Object} args
 * @param {string} args.pdfPath
 * @param {number} args.cambridgeBook
 * @param {number} args.testNumber
 * @param {'practice'|'exam'} args.mode
 * @returns {Promise<{ data: any, costUsd: number, tokensUsed: { input: number, output: number }, rawResponses: object }>}
 */
async function parseTestFromPdf({ pdfPath, cambridgeBook, testNumber, mode }) {
  const pdfBuffer = fs.readFileSync(pdfPath);
  const tokensUsed = { input: 0, output: 0 };
  let costUsd = 0;
  const rawResponses = {};

  // ---- Build a TOC-only slice for pass 1 ----
  // Cambridge IELTS books are 100-250 pages; the full PDF often exceeds the
  // Anthropic API 32 MB request limit. For pass 1 we only need:
  //   - first ~10 pages (table of contents)
  //   - last ~50 pages (audioscripts + answer keys)
  // That's plenty to locate the per-test page ranges.
  const srcDoc = await PDFDocument.load(pdfBuffer);
  const totalPages = srcDoc.getPageCount();
  const tocRange = [1, Math.min(10, totalPages)];
  const tailStart = Math.max(tocRange[1] + 1, totalPages - 49);
  const tailRange = tailStart <= totalPages ? [tailStart, totalPages] : null;
  const pass1Slice = await slicePdf(pdfBuffer, [tocRange, tailRange]);
  console.log(`  [parsePdf] total pages=${totalPages}, pass1 slice=${(pass1Slice.length / 1024 / 1024).toFixed(2)} MB (pages ${tocRange.join("-")} + ${tailRange ? tailRange.join("-") : "none"})`);

  // ---- Pass 1: locate pages (returns 1-indexed PAGE NUMBERS in the SLICE) ----
  console.log(`  [parsePdf] pass 1: locating pages for Test ${testNumber}...`);
  const pass1PromptText =
    pageLocatorPrompt(testNumber) +
    `\n\nIMPORTANT: The provided PDF is a SLICE containing only pages ${tocRange[0]}-${tocRange[1]} (TOC) and pages ${tailRange ? tailRange[0] + "-" + tailRange[1] : "n/a"} (audioscripts + answer keys) from the original ${totalPages}-page book. Return page numbers in the ORIGINAL book numbering, not the slice numbering. Use the printed Table of Contents and the audioscript/answer-key section headers to determine the original page numbers.`;
  const r1 = await callClaude(pass1Slice, pass1PromptText, 1024);
  tokensUsed.input += r1.usage.input_tokens || 0;
  tokensUsed.output += r1.usage.output_tokens || 0;
  costUsd += priceUsd(r1.usage);
  rawResponses.pass1 = r1.text;

  let pageMap;
  try {
    pageMap = JSON.parse(stripFences(r1.text));
  } catch (err) {
    throw new Error(`pass 1 returned non-JSON: ${r1.text.slice(0, 300)}`);
  }
  console.log(`  [parsePdf] page map: ${JSON.stringify(pageMap)}`);

  // Pad ranges defensively — Cambridge listening sections are typically 6-8
  // pages of questions and 4-6 pages of audioscripts; pass 1 sometimes
  // under-counts based on the printed TOC headings.
  const pad = (range, before, after) => {
    if (!Array.isArray(range)) return range;
    return [Math.max(1, range[0] - before), Math.min(totalPages, range[1] + after)];
  };
  const ranges = [
    pad(pageMap.questionPages, 1, 4),
    pad(pageMap.scriptPages, 1, 3),
    pad(pageMap.answerPages, 0, 1),
  ];
  console.log(`  [parsePdf] padded ranges: ${JSON.stringify(ranges)}`);

  // ---- Slice ----
  let sliced = pdfBuffer;
  if (ranges.some((r) => Array.isArray(r))) {
    console.log("  [parsePdf] slicing PDF to relevant pages...");
    sliced = await slicePdf(pdfBuffer, ranges);
    console.log(`  [parsePdf] sliced size: ${(sliced.length / 1024 / 1024).toFixed(2)} MB`);
  } else {
    console.warn("  [parsePdf] WARN: no ranges from pass 1; sending full PDF to pass 2");
  }

  // ---- Pass 2: extract structured JSON ----
  console.log("  [parsePdf] pass 2: extracting structured JSON...");
  let r2 = await callClaude(sliced, extractionPrompt(cambridgeBook, testNumber, mode), 16000);
  tokensUsed.input += r2.usage.input_tokens || 0;
  tokensUsed.output += r2.usage.output_tokens || 0;
  costUsd += priceUsd(r2.usage);
  rawResponses.pass2 = r2.text;

  let extracted;
  try {
    extracted = JSON.parse(stripFences(r2.text));
  } catch (err) {
    console.warn("  [parsePdf] pass 2 returned non-JSON; retrying once with stricter wording...");
    const retry = await callClaude(
      sliced,
      extractionPrompt(cambridgeBook, testNumber, mode) +
        "\n\nThe previous response was not valid JSON. Return ONLY the JSON object, no markdown, no commentary.",
      16000
    );
    tokensUsed.input += retry.usage.input_tokens || 0;
    tokensUsed.output += retry.usage.output_tokens || 0;
    costUsd += priceUsd(retry.usage);
    rawResponses.pass2_retry = retry.text;
    extracted = JSON.parse(stripFences(retry.text));
  }

  // Stitch in test/book/mode wrapper
  const data = {
    cambridgeBook,
    testNumber,
    mode,
    totalDurationSeconds: 0, // filled by orchestrator after audio metadata extraction
    parts: extracted.parts,
  };

  return { data, costUsd, tokensUsed, rawResponses };
}

module.exports = { parseTestFromPdf, slicePdf };
