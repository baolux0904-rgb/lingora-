/**
 * backend/scripts/seedReadingTests.js
 *
 * Seeds the reading_tests table with three Full Tests built from the
 * existing approved reading_passages pool:
 *
 *   - "Practice Test 1 — Foundation": three band_50_55 passages (entry).
 *   - "Practice Test 2 — Standard":   one band_50_55, one band_60_65, one
 *     band_70_80 — the canonical IELTS difficulty ramp.
 *   - "Practice Test 3 — Challenge":  one band_60_65, one band_70_80, one
 *     band_80_plus.
 *
 * Idempotent: skips a test if a row with the same title already exists.
 * Run as many times as you like; never duplicates.
 *
 * Usage (from backend/):
 *   node scripts/seedReadingTests.js
 */

"use strict";

const path = require("path");

const BACKEND_DIR = path.resolve(__dirname, "..");
require("dotenv").config({ path: path.join(BACKEND_DIR, ".env"), override: false });

const { pool } = require(path.join(BACKEND_DIR, "src", "config", "db.js"));

const TESTS = [
  {
    title: "Practice Test 1 — Foundation",
    difficulty_tier: "foundation",
    tiers: ["band_50_55", "band_50_55", "band_50_55"],
  },
  {
    title: "Practice Test 2 — Standard",
    difficulty_tier: "standard",
    tiers: ["band_50_55", "band_60_65", "band_70_80"],
  },
  {
    title: "Practice Test 3 — Challenge",
    difficulty_tier: "challenge",
    tiers: ["band_60_65", "band_70_80", "band_80_plus"],
  },
];

async function pickPassageIds(client, tiers) {
  // Walk the tier list left→right, pulling one approved passage per tier
  // while skipping anything we've already chosen for this test. Deterministic
  // ordering by id so reruns pick the same set when the pool is unchanged.
  const chosen = [];
  for (const tier of tiers) {
    const { rows } = await client.query(
      `SELECT id FROM reading_passages
        WHERE difficulty = $1
          AND review_status = 'approved'
          AND id <> ALL($2::uuid[])
        ORDER BY id
        LIMIT 1`,
      [tier, chosen]
    );
    if (rows.length === 0) {
      throw new Error(`Not enough approved passages for tier '${tier}' (need 1 more, none available)`);
    }
    chosen.push(rows[0].id);
  }
  return chosen;
}

async function seedOne(client, spec) {
  const { rows: existing } = await client.query(
    `SELECT id FROM reading_tests WHERE title = $1`,
    [spec.title]
  );
  if (existing.length > 0) {
    console.log(`  ↪ skip "${spec.title}" (already exists, id=${existing[0].id})`);
    return;
  }

  const ids = await pickPassageIds(client, spec.tiers);
  await client.query(
    `INSERT INTO reading_tests (title, difficulty_tier, passage_1_id, passage_2_id, passage_3_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [spec.title, spec.difficulty_tier, ids[0], ids[1], ids[2]]
  );
  console.log(`  ✓ inserted "${spec.title}" with passages ${ids.join(", ")}`);
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const spec of TESTS) {
      await seedOne(client, spec);
    }
    await client.query("COMMIT");
    console.log("Done.");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Seeding failed:", e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
