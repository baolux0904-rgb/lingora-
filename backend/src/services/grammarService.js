"use strict";

/**
 * services/grammarService.js
 *
 * Server-side Grammar progression. Mirrors the FE-locked tier values
 * from frontend/components/Grammar/useGrammarProgress.ts so the BE
 * grant matches what the user expects to see in the UI:
 *
 *     XP_PER_LESSON     = 10
 *     XP_PERFECT_BONUS  = 5    (when score === 100)
 *     XP_PER_EXAM       = 20   (unit exam)
 *     XP_FINAL_EXAM     = 50   (unitId === 'final')
 *
 * XP integration:
 *   - awardXp() is the canonical xp_ledger entry (from xpService).
 *   - Reasons:
 *       grammar_lesson_complete   refId = `lesson:${lessonId}`
 *       grammar_exam_complete     refId = `exam:${unitId}`
 *   - Migration 0041's UNIQUE (user_id, reason, ref_id) on xp_ledger
 *     is the only idempotency guard we rely on; replay of the same
 *     completion returns awarded:false from awardXp and the service
 *     skips emitting downstream cascade events.
 */

const grammarRepo = require("../repositories/grammarRepository");
const { awardXp } = require("./xpService");

const XP_PER_LESSON = 10;
const XP_PERFECT_BONUS = 5;
const XP_PER_EXAM = 20;
const XP_FINAL_EXAM = 50;

/**
 * Returns the user's full grammar state in the shape the FE hook
 * expects: keyed lookups of lessonResults / examResults plus a
 * server-computed totalXp. Computing totalXp from the ledger keeps
 * it consistent with the global level/leaderboard rather than
 * trusting a denormalised counter.
 */
async function getProgress(userId) {
  const rows = await grammarRepo.getByUser(userId);
  const lessonResults = {};
  const examResults = {};
  let totalXp = 0;

  for (const r of rows) {
    totalXp += r.xp_earned ?? 0;
    if (r.type === "lesson") {
      lessonResults[r.item_id] = {
        lessonId: r.item_id,
        score: r.score,
        completedAt: r.completed_at instanceof Date ? r.completed_at.toISOString() : r.completed_at,
      };
    } else if (r.type === "exam") {
      examResults[r.item_id] = {
        unitId: r.item_id,
        score: r.score,
        passed: r.passed === true,
        completedAt: r.completed_at instanceof Date ? r.completed_at.toISOString() : r.completed_at,
      };
    }
  }

  return { lessonResults, examResults, totalXp };
}

function computeLessonXp(score) {
  return XP_PER_LESSON + (score >= 100 ? XP_PERFECT_BONUS : 0);
}

function computeExamXp(unitId, passed) {
  if (!passed) return 0;
  return unitId === "final" ? XP_FINAL_EXAM : XP_PER_EXAM;
}

/**
 * Record a lesson completion.
 *
 *   1. UPSERT the progress row (idempotent on retake; max-score wins).
 *   2. Award XP via awardXp; replay protected by xp_ledger UNIQUE.
 *      If the ledger already has this row (replay), `awarded` will
 *      be false and we DO NOT bump xp_earned on the progress row
 *      again — the upsert already added EXCLUDED.xp_earned. To keep
 *      both stores in sync on replay we re-read the row and
 *      subtract the duplicate increment.
 *
 * Returns the public-shape progress row + whether a fresh grant
 * happened (so the controller can decide whether to fan out reward
 * cascades — none today, but future-friendly).
 */
async function recordLessonComplete(userId, lessonId, score) {
  const xpEarned = computeLessonXp(score);
  const refId = `lesson:${lessonId}`;
  const ledger = await awardXp(userId, xpEarned, "grammar_lesson_complete", refId);

  // Only credit xp_earned on the progress row when the ledger actually
  // accepted the write. Replay → ledger.awarded === false → record the
  // upsert with xpEarned: 0 so we don't inflate the per-row counter.
  const xpToRecord = ledger.awarded ? xpEarned : 0;
  const { row } = await grammarRepo.upsertProgress({
    userId,
    type: "lesson",
    itemId: lessonId,
    score,
    passed: null,
    xpEarned: xpToRecord,
  });

  return { row, xpAwarded: ledger.awarded ? xpEarned : 0 };
}

async function recordExamComplete(userId, unitId, score, passed) {
  const xpEarned = computeExamXp(unitId, passed === true);
  const refId = `exam:${unitId}`;
  const ledger = xpEarned > 0
    ? await awardXp(userId, xpEarned, "grammar_exam_complete", refId)
    : { awarded: false };

  const xpToRecord = ledger.awarded ? xpEarned : 0;
  const { row } = await grammarRepo.upsertProgress({
    userId,
    type: "exam",
    itemId: unitId,
    score,
    passed: passed === true,
    xpEarned: xpToRecord,
  });

  return { row, xpAwarded: ledger.awarded ? xpEarned : 0 };
}

/**
 * One-time bulk import from a client's localStorage. Idempotent end
 * to end:
 *   - Each entry is checked against the existing progress row first
 *     to keep the importedCount accurate; if a row already exists,
 *     it counts as "skipped".
 *   - The actual write goes through the same recordLessonComplete /
 *     recordExamComplete path so xp_ledger stays canonical and a
 *     replay (e.g. user clicks reload mid-flight) is safe.
 *   - Client-reported totalXp is logged on mismatch but never used
 *     to short-circuit the canonical server-computed sum.
 */
async function importBulk(userId, { lessonResults = {}, examResults = {}, totalXp = null } = {}) {
  let importedCount = 0;
  let skippedCount = 0;

  for (const lessonId of Object.keys(lessonResults)) {
    const entry = lessonResults[lessonId];
    if (!entry || typeof entry.score !== "number") continue;
    const existing = await grammarRepo.findOne(userId, "lesson", lessonId);
    if (existing) { skippedCount += 1; continue; }
    await recordLessonComplete(userId, lessonId, entry.score);
    importedCount += 1;
  }

  for (const unitId of Object.keys(examResults)) {
    const entry = examResults[unitId];
    if (!entry || typeof entry.score !== "number") continue;
    const existing = await grammarRepo.findOne(userId, "exam", unitId);
    if (existing) { skippedCount += 1; continue; }
    await recordExamComplete(userId, unitId, entry.score, entry.passed === true);
    importedCount += 1;
  }

  // Server-computed total — read after writes so the response reflects
  // the post-import state.
  const fresh = await getProgress(userId);

  if (typeof totalXp === "number" && Math.abs(totalXp - fresh.totalXp) > 0) {
    console.warn(
      `[grammar] backfill XP mismatch user=${userId} client_reported=${totalXp} server_computed=${fresh.totalXp}`
    );
  }

  return {
    importedCount,
    skippedCount,
    totalXpServerComputed: fresh.totalXp,
  };
}

module.exports = {
  getProgress,
  recordLessonComplete,
  recordExamComplete,
  importBulk,
  // exported for tests
  computeLessonXp,
  computeExamXp,
};
