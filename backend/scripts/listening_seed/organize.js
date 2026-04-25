#!/usr/bin/env node
/**
 * organize.js — Organize Cambridge IELTS 1-14 PDFs and audio into the
 * canonical listening_source/ structure expected by the seed pipeline.
 *
 * Source: ~/Downloads/ (looks for CAM*.zip and any pre-extracted CAM* folders)
 * Target: <repo-root>/listening_source/cam{NN}/{pdf,audio,maps}/
 *
 * Strictly file-org only: copy, never move. Originals untouched.
 *
 * Run: node backend/scripts/listening_seed/organize.js
 */

"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const TARGET_ROOT = path.join(REPO_ROOT, "listening_source");
const REPORT_PATH = path.join(__dirname, "_organize_report.md");
const INVENTORY_PATH = path.join(__dirname, "_organize_inventory.json");

const HOME = os.homedir();
const SOURCE_CANDIDATES = [
  path.join(HOME, "Downloads"),
];

const AUDIO_EXTS = new Set([".mp3", ".m4a", ".wav"]);

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.isFile()) out.push(full);
  }
  return out;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyIfNew(src, dst) {
  if (fs.existsSync(dst)) return { copied: false, reason: "already exists" };
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
  return { copied: true };
}

// Detect Cambridge book number from a string. Returns null if ambiguous/none.
// Avoids false positives on 4-digit years and 2-digit test numbers.
function inferBook(str) {
  const s = str.toLowerCase();
  // Match "cam" / "cambridge" + (optional separator) + 1-2 digit number, NOT followed by another digit
  const re = /(?:cam(?:bridge)?)\s*[-_ ]?(?:ielts\s*)?(\d{1,2})(?!\d)/g;
  let match;
  let book = null;
  while ((match = re.exec(s)) !== null) {
    const n = parseInt(match[1], 10);
    if (n >= 1 && n <= 14) {
      if (book !== null && book !== n) return null; // ambiguous
      book = n;
    }
  }
  return book;
}

// Detect (test, part) from a string. Test usually 1-4, Part 1-4.
function inferTestAndPart(str) {
  const s = str.toLowerCase().replace(/[._-]/g, " ");

  // Pattern Z: compact "C14T1S1" / "c12t3s4" — book.test.section all in one token.
  const z = str.match(/c(\d{1,2})t(\d)s(\d)/i);
  if (z) return { test: parseInt(z[2], 10), part: parseInt(z[3], 10) };

  // Pattern A: "test 1 section 2", "test1 part 2", "test 1 track 2"
  const a = s.match(/test\s*(\d)\s*(?:section|part|tape|track)\s*(\d)/);
  if (a) return { test: parseInt(a[1], 10), part: parseInt(a[2], 10) };

  // Pattern B: "X.Y.Z" style — Cambridge IELTS 7.1.2  (book.test.part)
  // Match a "N M" pair where the surrounding context isn't a year.
  const b = s.match(/cam(?:bridge)?\s*(?:ielts\s*)?\d{1,2}\s*[.\s-]\s*(\d)\s*[.\s-]\s*(\d)/);
  if (b) return { test: parseInt(b[1], 10), part: parseInt(b[2], 10) };

  // Pattern C: "1.2" embedded (book already inferred from folder)
  const c = s.match(/(?:^|[\s\/\\])(\d)\s*[.]\s*(\d)(?:[\s\/\\.]|$)/);
  if (c) {
    const t = parseInt(c[1], 10);
    const p = parseInt(c[2], 10);
    if (t >= 1 && t <= 4 && p >= 1 && p <= 4) return { test: t, part: p };
  }

  // Pattern D: just "test 1" — part inferred elsewhere
  // Pattern E: "section 1" / "part 1" / "track 1" — test inferred elsewhere
  const testOnly = s.match(/test\s*(\d)/);
  const partOnly = s.match(/(?:section|part|tape|track)\s*(\d)/);
  if (testOnly && partOnly) {
    return { test: parseInt(testOnly[1], 10), part: parseInt(partOnly[1], 10) };
  }
  if (testOnly && !partOnly) return { test: parseInt(testOnly[1], 10), part: null };
  if (!testOnly && partOnly) return { test: null, part: parseInt(partOnly[1], 10) };

  return { test: null, part: null };
}

// Walk a path's components from filename → parent → grandparent, trying to
// pull missing pieces out of folder names.
function inferAll(absPath) {
  const parts = absPath.split(/[\\/]/);
  let book = null;
  let test = null;
  let part = null;
  // Walk from leaf up — leaf is most specific.
  for (let i = parts.length - 1; i >= 0; i--) {
    const seg = parts[i];
    if (book === null) book = inferBook(seg);
    if (test === null || part === null) {
      const tp = inferTestAndPart(seg);
      if (test === null && tp.test !== null) test = tp.test;
      if (part === null && tp.part !== null) part = tp.part;
    }
    if (book !== null && test !== null && part !== null) break;
  }
  return { book, test, part };
}

// ---------------------------------------------------------------------------
// Step 1 — find source root
// ---------------------------------------------------------------------------

function findSourceRoot() {
  for (const candidate of SOURCE_CANDIDATES) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Step 2 — extract ZIPs (in place inside our scratch extract dir)
// ---------------------------------------------------------------------------

const EXTRACT_ROOT = path.join(__dirname, "_extracted");

function extractZip(zipPath) {
  const name = path.basename(zipPath, ".zip");
  const out = path.join(EXTRACT_ROOT, name);
  if (fs.existsSync(out) && fs.readdirSync(out).length > 0) {
    console.log(`  [skip] already extracted: ${name}`);
    return out;
  }
  ensureDir(out);
  console.log(`  [extract] ${path.basename(zipPath)} → ${out}`);
  // On Windows, prefer PowerShell Expand-Archive; on Unix, fall back to unzip.
  let r;
  if (process.platform === "win32") {
    r = spawnSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${out.replace(/'/g, "''")}' -Force`,
      ],
      { stdio: "inherit" }
    );
  } else {
    r = spawnSync("unzip", ["-q", "-o", zipPath, "-d", out], { stdio: "inherit" });
  }
  if (r.status !== 0) {
    throw new Error(`extract failed for ${zipPath} (exit ${r.status})`);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log("=== Cambridge IELTS Source Organizer ===\n");

  // --- find source ---
  const sourceRoot = findSourceRoot();
  if (!sourceRoot) {
    console.error(`ERROR: no source folder found. Tried: ${SOURCE_CANDIDATES.join(", ")}`);
    process.exit(1);
  }
  console.log(`Source: ${sourceRoot}\n`);

  // --- inventory pass 1: find Cambridge zips + already-extracted folders ---
  console.log("[1/6] Scanning source for Cambridge zips and folders...");
  const all = walk(sourceRoot);
  const cambridgeZips = all.filter((p) => {
    const b = path.basename(p).toLowerCase();
    return b.endsWith(".zip") && /^cam\d/i.test(path.basename(p));
  });
  console.log(`  Cambridge zips: ${cambridgeZips.length}`);
  for (const z of cambridgeZips) console.log(`    - ${path.basename(z)} (${fmtBytes(fs.statSync(z).size)})`);

  // --- extract zips (recursive — nested zips often hold the actual audio) ---
  if (cambridgeZips.length > 0) {
    console.log("\n[2/6] Extracting top-level zips...");
    ensureDir(EXTRACT_ROOT);
    for (const z of cambridgeZips) extractZip(z);
  } else {
    console.log("\n[2/6] No top-level zips.");
  }

  // Recursively extract any nested zips (in place, into a sibling folder).
  console.log("\n[2b/6] Extracting nested zips...");
  for (let pass = 0; pass < 5; pass++) {
    const found = walk(EXTRACT_ROOT).filter((p) => p.toLowerCase().endsWith(".zip"));
    if (found.length === 0) break;
    console.log(`  pass ${pass + 1}: ${found.length} nested zip(s)`);
    for (const z of found) {
      const out = path.join(path.dirname(z), path.basename(z, path.extname(z)) + "_unzipped");
      if (fs.existsSync(out) && fs.readdirSync(out).length > 0) continue;
      ensureDir(out);
      console.log(`    [extract] ${z} → ${out}`);
      let r;
      if (process.platform === "win32") {
        r = spawnSync(
          "powershell.exe",
          [
            "-NoProfile",
            "-Command",
            `Expand-Archive -LiteralPath '${z.replace(/'/g, "''")}' -DestinationPath '${out.replace(/'/g, "''")}' -Force`,
          ],
          { stdio: "inherit" }
        );
      } else {
        r = spawnSync("unzip", ["-q", "-o", z, "-d", out], { stdio: "inherit" });
      }
      if (r.status !== 0) {
        console.warn(`    WARN: extract failed for ${z} (exit ${r.status}) — continuing`);
      }
    }
  }

  // --- inventory pass 2: walk extracted dir + source dir for PDFs/audio ---
  console.log("\n[3/6] Building file inventory...");
  const scanDirs = [];
  if (fs.existsSync(EXTRACT_ROOT)) scanDirs.push(EXTRACT_ROOT);
  // Also include any pre-existing CAM* folders in source root
  for (const e of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
    if (e.isDirectory() && /^cam\d/i.test(e.name)) {
      scanDirs.push(path.join(sourceRoot, e.name));
    }
  }

  const allFiles = [];
  for (const d of scanDirs) walk(d, allFiles);

  // Filter macOS resource-fork artifacts: __MACOSX folders + AppleDouble "._*" files.
  const isJunk = (p) => /__MACOSX/i.test(p) || /[\\/]\._[^\\/]*$/.test(p);
  const pdfs = allFiles.filter((p) => p.toLowerCase().endsWith(".pdf") && !isJunk(p));
  const audios = allFiles.filter((p) => AUDIO_EXTS.has(path.extname(p).toLowerCase()) && !isJunk(p));
  const zips = allFiles.filter((p) => p.toLowerCase().endsWith(".zip") && !isJunk(p));
  console.log(`  PDFs:   ${pdfs.length}`);
  console.log(`  Audio:  ${audios.length}`);
  console.log(`  ZIPs:   ${zips.length}`);

  // --- save inventory JSON ---
  ensureDir(path.dirname(INVENTORY_PATH));
  fs.writeFileSync(
    INVENTORY_PATH,
    JSON.stringify(
      {
        sourceRoot,
        extractedRoot: EXTRACT_ROOT,
        cambridgeZips,
        pdfs: pdfs.map((p) => ({ path: p, size: fs.statSync(p).size })),
        audios: audios.map((p) => ({ path: p, size: fs.statSync(p).size })),
      },
      null,
      2
    )
  );

  // --- map PDFs to books ---
  console.log("\n[4/6] Routing PDFs to books...");
  const unmatched = [];
  /** @type {Record<number, string[]>} */
  const pdfByBook = {};
  for (const p of pdfs) {
    const { book } = inferAll(p);
    if (book === null) {
      unmatched.push({ kind: "pdf", path: p, reason: "no book number" });
      continue;
    }
    (pdfByBook[book] ||= []).push(p);
  }
  for (const b of Object.keys(pdfByBook).sort((a, c) => +a - +c)) {
    console.log(`  Cam ${String(b).padStart(2, "0")}: ${pdfByBook[b].length} PDF(s)`);
  }

  // --- map audio to (book,test,part) ---
  console.log("\n[5/6] Routing audio to (book, test, part)...");
  /** @type {Record<string,string>} */
  const audioByKey = {}; // key = `${book}-${test}-${part}` → src path (first wins)
  const audioDupes = [];
  const remaps = []; // log Vietnamese-seller renumbering quirks for the report
  for (const a of audios) {
    let { book, test, part } = inferAll(a);
    if (book === null || test === null || part === null) {
      unmatched.push({ kind: "audio", path: a, reason: `book=${book},test=${test},part=${part}` });
      continue;
    }
    // Vietnamese sellers sometimes bundle Cam {N+1}'s Tests 1..4 inside Cam
    // {N}'s zip and renumber them as Tests 5..8. If we see test 5..8 and the
    // adjacent book exists in our 1..14 range, remap to (book+1, test-4).
    if (test >= 5 && test <= 8 && book >= 1 && book <= 13) {
      const newBook = book + 1;
      const newTest = test - 4;
      remaps.push({ from: { book, test, part }, to: { book: newBook, test: newTest, part }, src: a });
      book = newBook;
      test = newTest;
    }
    if (book < 1 || book > 14 || test < 1 || test > 4 || part < 1 || part > 4) {
      unmatched.push({ kind: "audio", path: a, reason: `out-of-range (book=${book},test=${test},part=${part})` });
      continue;
    }
    const key = `${book}-${test}-${part}`;
    if (audioByKey[key]) {
      audioDupes.push({ key, kept: audioByKey[key], skipped: a });
      continue;
    }
    audioByKey[key] = a;
  }
  if (remaps.length > 0) {
    console.log(`  [remap] applied Test 5-8 → next-book Test 1-4 to ${remaps.length} file(s)`);
  }
  console.log(`  Mapped audio files: ${Object.keys(audioByKey).length}`);
  console.log(`  Duplicates skipped: ${audioDupes.length}`);
  console.log(`  Unmatched files:    ${unmatched.length}`);

  // --- copy to canonical structure ---
  console.log("\n[6/6] Copying to canonical structure at listening_source/...");
  ensureDir(TARGET_ROOT);

  for (let book = 1; book <= 14; book++) {
    const nn = String(book).padStart(2, "0");
    const bookDir = path.join(TARGET_ROOT, `cam${nn}`);
    ensureDir(path.join(bookDir, "pdf"));
    ensureDir(path.join(bookDir, "audio"));
    ensureDir(path.join(bookDir, "maps"));

    // PDF — prefer the LARGEST file (full books are 8-25 MB; teasers/answer
    // keys / Vietnamese chữa-đề PDFs are <1 MB and would otherwise win
    // alphabetically).
    if (pdfByBook[book]) {
      const sorted = pdfByBook[book]
        .map((p) => ({ p, size: fs.statSync(p).size }))
        .sort((a, b) => b.size - a.size);
      const winner = sorted[0].p;
      const dst = path.join(bookDir, "pdf", `cam${nn}.pdf`);
      copyIfNew(winner, dst);
      for (const { p: extra, size } of sorted.slice(1)) {
        unmatched.push({
          kind: "pdf",
          path: extra,
          reason: `extra PDF for cam${nn} (${fmtBytes(size)}), kept largest (${fmtBytes(sorted[0].size)})`,
        });
      }
    }

    // Audio (16 files per book)
    for (let test = 1; test <= 4; test++) {
      for (let part = 1; part <= 4; part++) {
        const src = audioByKey[`${book}-${test}-${part}`];
        if (!src) continue;
        const dst = path.join(bookDir, "audio", `test${test}_part${part}.mp3`);
        copyIfNew(src, dst);
      }
    }
  }

  // --- validation report ---
  console.log("\n=== Generating Report ===\n");

  const lines = [];
  lines.push("# Cambridge IELTS Source Data — Organize Report");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Source:    ${sourceRoot}`);
  lines.push(`Target:    ${TARGET_ROOT}`);
  lines.push("");
  lines.push("## Per-Book Status");
  lines.push("");
  lines.push("| Book | PDF | Audio | Notes |");
  lines.push("|------|-----|-------|-------|");

  const fullyReady = [];
  const missingPdf = [];
  const incompleteAudio = [];
  let totalBytes = 0;

  for (let book = 1; book <= 14; book++) {
    const nn = String(book).padStart(2, "0");
    const bookDir = path.join(TARGET_ROOT, `cam${nn}`);
    const pdfFile = path.join(bookDir, "pdf", `cam${nn}.pdf`);

    let pdfStatus = "✗ MISSING";
    if (fs.existsSync(pdfFile)) {
      const sz = fs.statSync(pdfFile).size;
      totalBytes += sz;
      pdfStatus = `✓ ${fmtBytes(sz)}`;
    } else {
      missingPdf.push(book);
    }

    const missing = [];
    let audioCount = 0;
    for (let t = 1; t <= 4; t++) {
      for (let p = 1; p <= 4; p++) {
        const f = path.join(bookDir, "audio", `test${t}_part${p}.mp3`);
        if (fs.existsSync(f)) {
          audioCount++;
          totalBytes += fs.statSync(f).size;
        } else {
          missing.push(`test${t}_part${p}`);
        }
      }
    }

    const audioStatus = audioCount === 16 ? "✓ 16/16" : `✗ ${audioCount}/16`;
    if (audioCount < 16) incompleteAudio.push({ book, missing });

    if (audioCount === 16 && fs.existsSync(pdfFile)) fullyReady.push(book);

    const notes = audioCount < 16 ? `MISSING: ${missing.join(", ")}` : "";
    lines.push(`| Cam ${nn} | ${pdfStatus} | ${audioStatus} | ${notes} |`);
  }

  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Books fully ready** (PDF + 16 audio): ${fullyReady.length} → ${fullyReady.join(", ") || "none"}`);
  lines.push(`- **Books missing PDF**:                  ${missingPdf.length} → ${missingPdf.join(", ") || "none"}`);
  lines.push(`- **Books with incomplete audio**:        ${incompleteAudio.length}`);
  for (const r of incompleteAudio) {
    lines.push(`  - Cam ${r.book}: missing ${r.missing.join(", ")}`);
  }
  lines.push(`- **Total disk usage at listening_source/**: ${fmtBytes(totalBytes)}`);
  lines.push("");

  if (unmatched.length > 0) {
    lines.push("## Unmatched Files (not copied)");
    lines.push("");
    for (const u of unmatched.slice(0, 50)) {
      lines.push(`- [${u.kind}] \`${u.path}\` — ${u.reason}`);
    }
    if (unmatched.length > 50) lines.push(`- … (${unmatched.length - 50} more)`);
    lines.push("");
  }

  if (typeof remaps !== "undefined" && remaps.length > 0) {
    lines.push("## Audio Remaps (Vietnamese-seller renumbering)");
    lines.push("");
    lines.push("These files had test numbers 5-8 and were remapped to the next book's tests 1-4.");
    lines.push("Inspect a sample to confirm before relying on the seed pipeline.");
    lines.push("");
    for (const r of remaps.slice(0, 30)) {
      lines.push(`- (cam${String(r.from.book).padStart(2,"0")} test${r.from.test} part${r.from.part}) → (cam${String(r.to.book).padStart(2,"0")} test${r.to.test} part${r.to.part}) — \`${path.basename(r.src)}\``);
    }
    if (remaps.length > 30) lines.push(`- … (${remaps.length - 30} more)`);
    lines.push("");
  }

  if (audioDupes.length > 0) {
    lines.push("## Audio Duplicates (skipped — first match kept)");
    lines.push("");
    for (const d of audioDupes.slice(0, 30)) {
      lines.push(`- key=${d.key}: kept \`${path.basename(d.kept)}\`, skipped \`${path.basename(d.skipped)}\``);
    }
    if (audioDupes.length > 30) lines.push(`- … (${audioDupes.length - 30} more)`);
    lines.push("");
  }

  fs.writeFileSync(REPORT_PATH, lines.join("\n"));

  // Print summary to stdout
  console.log(lines.slice(0, 80).join("\n"));
  console.log(`\n[report] full report: ${REPORT_PATH}`);
  console.log(`[inventory] ${INVENTORY_PATH}`);

  return { fullyReady, missingPdf, incompleteAudio, totalBytes, reportPath: REPORT_PATH };
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error("FATAL:", err.message);
    console.error(err.stack);
    process.exit(1);
  }
}
