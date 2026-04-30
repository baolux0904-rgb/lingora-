"use strict";

/**
 * repositories/grammarRepository.js
 *
 * SQL for the grammar_progress table (migration 0055).
 *
 * UPSERT semantics: ON CONFLICT (user_id, type, item_id):
 *   - score   ← GREATEST(existing.score, EXCLUDED.score)
 *               higher retake never overwrites a lower one
 *   - passed  ← existing.passed OR EXCLUDED.passed
 *               once passed always passed
 *   - xp_earned, completed_at, updated_at follow the row of record
 *     for THIS upsert call. The service layer relies on the
 *     xp_ledger UNIQUE (user_id, reason, ref_id) from migration 0041
 *     for double-credit protection — this table tracks the latest
 *     known progress shape, not a cumulative XP ledger.
 */

const { query } = require("../config/db");

/**
 * Upsert a single progress row.
 * Returns { row, inserted: boolean } so the service can branch on
 * "first time seen" (emit xp_ledger) vs. "replay" (skip cascade).
 */
async function upsertProgress({ userId, type, itemId, score, passed, xpEarned }) {
  const result = await query(
    `INSERT INTO grammar_progress (user_id, type, item_id, score, passed, xp_earned, completed_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
     ON CONFLICT (user_id, type, item_id) DO UPDATE
       SET score      = GREATEST(grammar_progress.score, EXCLUDED.score),
           passed     = grammar_progress.passed OR COALESCE(EXCLUDED.passed, FALSE),
           xp_earned  = grammar_progress.xp_earned + EXCLUDED.xp_earned,
           updated_at = NOW()
     RETURNING *, (xmax = 0) AS inserted`,
    [userId, type, itemId, score, passed ?? null, xpEarned ?? 0]
  );
  const row = result.rows[0];
  return { row, inserted: row.inserted === true };
}

async function getByUser(userId) {
  const result = await query(
    `SELECT type, item_id, score, passed, xp_earned, completed_at, updated_at
       FROM grammar_progress
      WHERE user_id = $1
      ORDER BY completed_at ASC`,
    [userId]
  );
  return result.rows;
}

/** Look up a single row — used by backfill to detect "already migrated". */
async function findOne(userId, type, itemId) {
  const result = await query(
    `SELECT * FROM grammar_progress
      WHERE user_id = $1 AND type = $2 AND item_id = $3
      LIMIT 1`,
    [userId, type, itemId]
  );
  return result.rows[0] ?? null;
}

module.exports = { upsertProgress, getByUser, findOne };
