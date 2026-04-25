/**
 * lib/normalizeFilenames.js
 *
 * Defensive pass: rename arbitrary Cambridge audio filenames in a folder to
 * the canonical `test{T}_part{P}.mp3` form. Idempotent.
 *
 * CLI:
 *   node backend/scripts/listening_seed/lib/normalizeFilenames.js --dir <path>
 */

"use strict";

const fs = require("fs");
const path = require("path");

const PATTERNS = [
  // C14T1S1, c10t1s1
  /c\d{1,2}t(\d)s(\d)/i,
  // "Test 1 Section 1", "test1 part2", "Test 1 - Track 3"
  /test\s*(\d)\s*(?:section|part|tape|track)\s*(\d)/i,
  // "T1S1" / "T1P1"
  /t(\d)\s*(?:s|p)(\d)/i,
];

/**
 * Try to extract (test, part) from a filename. Returns null if no pattern matches.
 *
 * @param {string} filename
 * @returns {{ test: number, part: number } | null}
 */
function inferTestAndPart(filename) {
  for (const re of PATTERNS) {
    const m = filename.match(re);
    if (m) {
      const t = parseInt(m[1], 10);
      const p = parseInt(m[2], 10);
      if (t >= 1 && t <= 4 && p >= 1 && p <= 4) return { test: t, part: p };
    }
  }
  return null;
}

/**
 * Normalize all .mp3 files in a directory to test{T}_part{P}.mp3.
 *
 * @param {string} dir
 * @returns {{ renamed: Array<{from: string, to: string}>, alreadyCanonical: string[], unmatched: string[] }}
 */
function normalize(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(`not a directory: ${dir}`);
  }
  const renamed = [];
  const alreadyCanonical = [];
  const unmatched = [];
  const canonical = /^test([1-4])_part([1-4])\.mp3$/i;

  for (const name of fs.readdirSync(dir)) {
    if (!name.toLowerCase().endsWith(".mp3")) continue;
    if (canonical.test(name)) {
      alreadyCanonical.push(name);
      continue;
    }
    const tp = inferTestAndPart(name);
    if (!tp) {
      unmatched.push(name);
      continue;
    }
    const target = `test${tp.test}_part${tp.part}.mp3`;
    const src = path.join(dir, name);
    const dst = path.join(dir, target);
    if (fs.existsSync(dst)) {
      // canonical already there — skip rename to avoid clobber
      unmatched.push(`${name} (target ${target} already exists)`);
      continue;
    }
    fs.renameSync(src, dst);
    renamed.push({ from: name, to: target });
  }
  return { renamed, alreadyCanonical, unmatched };
}

if (require.main === module) {
  const argIdx = process.argv.indexOf("--dir");
  if (argIdx === -1 || !process.argv[argIdx + 1]) {
    console.error("Usage: node normalizeFilenames.js --dir <path>");
    process.exit(2);
  }
  const dir = process.argv[argIdx + 1];
  const r = normalize(dir);
  for (const { from, to } of r.renamed) console.log(`  RENAMED: ${from} → ${to}`);
  console.log(`\n  Renamed:           ${r.renamed.length}`);
  console.log(`  Already canonical: ${r.alreadyCanonical.length}`);
  console.log(`  Unmatched:         ${r.unmatched.length}`);
  if (r.unmatched.length > 0) {
    console.log("  --- unmatched (rename manually):");
    for (const u of r.unmatched) console.log(`    - ${u}`);
  }
}

module.exports = { normalize, inferTestAndPart };
