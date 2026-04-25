#!/usr/bin/env node
/**
 * seedOneTest.js — Seed one Cambridge IELTS Listening test end-to-end.
 *
 * Usage:
 *   node backend/scripts/listening_seed/seedOneTest.js \
 *     --book 10 --test 1 --mode exam \
 *     [--dry-run | --apply] \
 *     [--source-dir ./listening_source] \
 *     [--auto-pick]
 *
 * Flow: parse PDF (Claude vision) → validate → save JSON → (if --apply)
 *       extract audio meta → upload to R2 → seed DB.
 *
 * Outputs: backend/scripts/listening_seed/output/cam{NN}/test{T}.{json,raw.json,errors.txt}
 */

"use strict";

// override:true because the calling shell may set an empty ANTHROPIC_API_KEY
// (Claude Code injects one) that would otherwise win over our backend/.env.
require("dotenv").config({
  path: require("path").join(__dirname, "..", "..", ".env"),
  override: true,
});

const fs = require("fs");
const path = require("path");
const { parseTestFromPdf } = require("./lib/parsePdf");
const { extractAudioMetadata } = require("./lib/extractAudio");
const { uploadAssets } = require("./lib/uploadAssets");
const { seedTest } = require("./lib/seedDb");
const { validateTestData } = require("./schemas/testData");

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

function parseArgs() {
  const a = process.argv.slice(2);
  const get = (flag) => {
    const i = a.indexOf(flag);
    return i === -1 ? null : a[i + 1];
  };
  const has = (flag) => a.includes(flag);
  return {
    book: get("--book") ? parseInt(get("--book"), 10) : null,
    test: get("--test") ? parseInt(get("--test"), 10) : null,
    mode: get("--mode") || "exam",
    sourceDir: get("--source-dir") || path.join(REPO_ROOT, "listening_source"),
    dryRun: has("--dry-run"),
    apply: has("--apply"),
    autoPick: has("--auto-pick"),
  };
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function usage() {
  console.error(
    "Usage: node seedOneTest.js --book N --test M --mode exam [--dry-run|--apply] [--source-dir DIR] [--auto-pick]"
  );
}

async function autoPickIfNeeded(args) {
  if (!args.autoPick) return args;
  const candidates = [10, 11, 12, 14];
  for (const b of candidates) {
    const camDir = path.join(args.sourceDir, `cam${pad(b)}`);
    const pdfFile = path.join(camDir, "pdf", `cam${pad(b)}.pdf`);
    const audioDir = path.join(camDir, "audio");
    if (!fs.existsSync(pdfFile) || !fs.existsSync(audioDir)) continue;
    for (let t = 1; t <= 4; t++) {
      let ok = true;
      for (let p = 1; p <= 4; p++) {
        if (!fs.existsSync(path.join(audioDir, `test${t}_part${p}.mp3`))) { ok = false; break; }
      }
      if (ok) {
        console.log(`[auto-pick] Cam ${b}, Test ${t} (first complete pair found)`);
        return { ...args, book: b, test: t };
      }
    }
  }
  throw new Error("--auto-pick: no complete (book,test) pair found in source-dir");
}

function validateSourceData(args) {
  const camDir = path.join(args.sourceDir, `cam${pad(args.book)}`);
  const pdfFile = path.join(camDir, "pdf", `cam${pad(args.book)}.pdf`);
  const audioDir = path.join(camDir, "audio");
  const errs = [];
  if (!fs.existsSync(pdfFile)) errs.push(`PDF missing: ${pdfFile}`);
  for (let p = 1; p <= 4; p++) {
    const f = path.join(audioDir, `test${args.test}_part${p}.mp3`);
    if (!fs.existsSync(f)) errs.push(`audio missing: ${f}`);
  }
  if (errs.length > 0) {
    console.error("ERROR: source data incomplete:");
    for (const e of errs) console.error(`  - ${e}`);
    process.exit(1);
  }
  return { camDir, pdfFile, audioDir };
}

async function main() {
  let args = parseArgs();
  if (!args.book || !args.test) {
    if (!args.autoPick) {
      usage();
      process.exit(2);
    }
  }
  if (!args.dryRun && !args.apply) {
    console.error("ERROR: must pass either --dry-run or --apply");
    usage();
    process.exit(2);
  }

  args = await autoPickIfNeeded(args);

  const { pdfFile, audioDir, camDir } = validateSourceData(args);
  const mapsDir = path.join(camDir, "maps");

  const outDir = path.join(__dirname, "output", `cam${pad(args.book)}`);
  fs.mkdirSync(outDir, { recursive: true });
  const validatedJsonPath = path.join(outDir, `test${args.test}.json`);
  const rawJsonPath = path.join(outDir, `test${args.test}.raw.json`);
  const errorsPath = path.join(outDir, `test${args.test}.errors.txt`);

  console.log(`\n=== Seed one test: Cam ${args.book} Test ${args.test} (${args.mode}) ===`);
  console.log(`  PDF:    ${pdfFile}`);
  console.log(`  Audio:  ${audioDir}`);
  console.log(`  Output: ${outDir}\n`);

  const t0 = Date.now();

  // ---- 1. Parse PDF ----
  console.log("[1] Parsing PDF via Claude vision...");
  const parseResult = await parseTestFromPdf({
    pdfPath: pdfFile,
    cambridgeBook: args.book,
    testNumber: args.test,
    mode: args.mode,
  });
  fs.writeFileSync(rawJsonPath, JSON.stringify(parseResult, null, 2));
  console.log(`  parsed: ${parseResult.tokensUsed.input} in / ${parseResult.tokensUsed.output} out tokens, $${parseResult.costUsd.toFixed(4)}`);

  // ---- 2. Audio metadata (needed before validate so totalDuration is set) ----
  console.log("\n[2] Extracting audio metadata...");
  const audioMeta = await extractAudioMetadata(audioDir, args.test);
  for (let p = 1; p <= 4; p++) {
    const info = audioMeta[`part${p}`];
    console.log(`  part${p}: ${info.durationSeconds}s @ ${info.bitrate}bps`);
    parseResult.data.parts.find((x) => x.partNumber === p).audioLocalPath = info.localPath;
    parseResult.data.parts.find((x) => x.partNumber === p).audioDurationSeconds = info.durationSeconds;
  }
  parseResult.data.totalDurationSeconds = audioMeta.totalDurationSeconds;

  // ---- 3. Validate ----
  console.log("\n[3] Validating extracted JSON...");
  const v = validateTestData(parseResult.data);
  if (!v.valid) {
    fs.writeFileSync(errorsPath, v.errors.join("\n"));
    console.error("VALIDATION FAILED:");
    for (const e of v.errors) console.error(`  - ${e}`);
    console.error(`\n  errors written to: ${errorsPath}`);
    fs.writeFileSync(validatedJsonPath, JSON.stringify(parseResult.data, null, 2));
    process.exit(1);
  }
  fs.writeFileSync(validatedJsonPath, JSON.stringify(parseResult.data, null, 2));
  console.log(`  ✓ valid — ${parseResult.data.parts.length} parts, ${countQuestions(parseResult.data)} questions`);

  // ---- 4. Summary table ----
  printSummary(parseResult.data, parseResult);

  if (args.dryRun) {
    console.log(`\n=== DRY RUN — no R2 uploads, no DB writes ===`);
    console.log(`  Validated JSON: ${validatedJsonPath}`);
    console.log(`  Raw response:   ${rawJsonPath}`);
    return { parseResult, audioMeta, applied: false };
  }

  // ---- 5. Upload R2 ----
  console.log("\n[5] Uploading audio (and maps if present) to R2...");
  const keys = await uploadAssets({
    cambridgeBook: args.book,
    testNumber: args.test,
    audioMeta,
    mapsFolderPath: fs.existsSync(mapsDir) ? mapsDir : null,
  });
  console.log(`  uploaded ${(keys.bytesUploaded / 1024 / 1024).toFixed(2)} MB, ${keys.skipped} skipped`);

  // ---- 6. DB seed ----
  console.log("\n[6] Seeding DB...");
  const seedResult = await seedTest(parseResult.data, keys);
  if (seedResult.skipped) {
    console.log(`  test row already exists (id=${seedResult.testId}) — no rows inserted`);
  } else {
    console.log(`  inserted: testId=${seedResult.testId}, parts=${seedResult.partIds.length}, groups=${seedResult.questionGroupCount}, questions=${seedResult.questionCount}`);
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n=== Seed Report: Cam ${args.book} Test ${args.test} (${args.mode}) ===`);
  console.log(`PDF parse:     ${parseResult.tokensUsed.input} in / ${parseResult.tokensUsed.output} out tokens, $${parseResult.costUsd.toFixed(4)}`);
  console.log(`Audio:         4 files, ${audioMeta.totalDurationSeconds}s total`);
  console.log(`R2 upload:     ${(keys.bytesUploaded / 1024 / 1024).toFixed(2)} MB (${keys.skipped} skipped)`);
  console.log(`DB seed:       ${seedResult.skipped ? "SKIP (existed)" : `1 test, ${seedResult.partIds.length} parts, ${seedResult.questionGroupCount} groups, ${seedResult.questionCount} questions`}`);
  console.log(`Total time:    ${elapsed}s`);
  console.log(`Total cost:    $${parseResult.costUsd.toFixed(4)}`);
  console.log("=".repeat(60));

  return { parseResult, audioMeta, keys, seedResult, elapsedSec: elapsed, applied: true };
}

function countQuestions(data) {
  let n = 0;
  for (const p of data.parts) for (const g of p.questionGroups) n += g.questions.length;
  return n;
}

function printSummary(data, parseResult) {
  console.log("\n  --- per-part summary ---");
  for (const p of data.parts) {
    console.log(
      `  Part ${p.partNumber}: "${p.topic}" | ${p.audioDurationSeconds}s | transcript ${p.transcript.length} chars | ${p.questionGroups.length} groups | ${p.questionGroups.reduce((a, g) => a + g.questions.length, 0)} questions`
    );
    for (const g of p.questionGroups) {
      console.log(`    - ${g.questionType} × ${g.questions.length}`);
    }
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("\nFATAL:", err.message);
      console.error(err.stack);
      process.exit(1);
    });
}

module.exports = { main };
