/**
 * backend/scripts/seedCurrent.js
 *
 * Runs backend/sql/seed_current.sql using the existing db pool
 * from config/db.js. No new dependencies. No schema changes.
 *
 * Usage (from backend/ directory):
 *   node scripts/seedCurrent.js
 *
 * Usage (from repo root):
 *   node backend/scripts/seedCurrent.js
 */

"use strict";

const path = require("path");
const fs   = require("fs");

// ── Paths ──────────────────────────────────────────────────
const BACKEND_DIR = path.resolve(__dirname, "..");
const SQL_FILE    = path.join(BACKEND_DIR, "sql", "seed_current.sql");
const DB_MODULE   = path.join(BACKEND_DIR, "src", "config", "db.js");

// ── Validate files exist before doing anything ─────────────
if (!fs.existsSync(SQL_FILE)) {
  console.error(`✖  Not found: ${SQL_FILE}`);
  process.exit(1);
}
if (!fs.existsSync(DB_MODULE)) {
  console.error(`✖  Not found: ${DB_MODULE}`);
  process.exit(1);
}

// ── Load the existing pool ─────────────────────────────────
// db.js exports either the pool directly or { query, pool }.
// We need a client so the BEGIN/COMMIT in the SQL file works
// as a single transaction.
const db = require(DB_MODULE);
const pool = (db && typeof db.connect === "function") ? db
           : (db && db.pool)                          ? db.pool
           : null;

if (!pool) {
  console.error("✖  Could not resolve a pg Pool from config/db.js.");
  console.error("   Expected: module.exports = pool  OR  module.exports.pool = pool");
  process.exit(1);
}

// ── Execute ────────────────────────────────────────────────
async function run() {
  const sql = fs.readFileSync(SQL_FILE, "utf8");

  console.log("🌱  Seeding Lingora database …");
  console.log(`    SQL  : ${SQL_FILE}\n`);

  const client = await pool.connect();
  try {
    // The SQL file already contains BEGIN / COMMIT.
    // Running it through a single client keeps it in one connection.
    await client.query(sql);
    console.log("✅  Seed applied.\n");

    // ── Verification: show row counts ──────────────────────
    const tables = [
      "lessons",
      "vocab_items",
      "quiz_items",
      "speaking_prompts",
    ];

    console.log("    Row counts after seed:");
    for (const table of tables) {
      const { rows } = await client.query(
        `SELECT COUNT(*) AS n FROM ${table}`
      );
      console.log(`      ${table.padEnd(20)} ${rows[0].n}`);
    }

    // ── Quick sanity: lesson_summary view ─────────────────
    console.log("\n    lesson_summary (first 5 rows):");
    const { rows: summary } = await client.query(
      `SELECT id, title, level, order_index, vocab_count, quiz_count, speaking_count
       FROM lesson_summary
       ORDER BY order_index ASC
       LIMIT 5`
    );
    for (const row of summary) {
      console.log(
        `      [${row.order_index}] ${row.title.padEnd(24)}` +
        `  level=${row.level.padEnd(10)}` +
        `  vocab=${row.vocab_count}  quiz=${row.quiz_count}  speaking=${row.speaking_count}`
      );
    }

    console.log("\n🎉  Done. GET /api/v1/lessons should now return 5 lessons.");
  } catch (err) {
    console.error("\n✖  Seed failed:", err.message);
    console.error(err);
    process.exit(1);
  } finally {
    client.release();
    // Allow the pool to drain before the process exits.
    setTimeout(() => process.exit(0), 200);
  }
}

run();
