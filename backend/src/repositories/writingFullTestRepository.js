/**
 * repositories/writingFullTestRepository.js
 *
 * SQL for writing_full_tests (migration 0036). The row tracks one exam
 * run from "start" → "submitted | expired", linking the two submitted
 * essays and the prompts they were scored against.
 */

"use strict";

const { query } = require("../config/db");

async function createRun({ userId, task1QuestionId, task2QuestionId }) {
  const result = await query(
    `INSERT INTO writing_full_tests
       (user_id, task1_question_id, task2_question_id, status, started_at)
     VALUES ($1, $2, $3, 'in_progress', now())
     RETURNING *`,
    [userId, task1QuestionId, task2QuestionId]
  );
  return result.rows[0];
}

async function getRunById(id) {
  const result = await query(`SELECT * FROM writing_full_tests WHERE id = $1`, [id]);
  return result.rows[0] ?? null;
}

/**
 * Link a submission to a run's task1 or task2 slot. Only writes when the
 * slot is currently NULL so a double-call is a no-op.
 *
 * @param {string} runId
 * @param {'task1'|'task2'} taskType
 * @param {string} submissionId
 */
async function linkSubmission(runId, taskType, submissionId) {
  const col = taskType === "task1" ? "task1_submission_id" : "task2_submission_id";
  const result = await query(
    `UPDATE writing_full_tests
        SET ${col} = $2
      WHERE id = $1 AND ${col} IS NULL
      RETURNING *`,
    [runId, submissionId]
  );
  return result.rows[0] ?? null;
}

async function finalizeRun(runId, { overallBand, totalTimeSeconds }) {
  const result = await query(
    `UPDATE writing_full_tests
        SET status                  = 'submitted',
            submitted_at            = now(),
            overall_band            = $2,
            total_time_used_seconds = $3
      WHERE id = $1 AND status = 'in_progress'
      RETURNING *`,
    [runId, overallBand, totalTimeSeconds]
  );
  return result.rows[0] ?? null;
}

async function markExpired(runId, totalTimeSeconds) {
  const result = await query(
    `UPDATE writing_full_tests
        SET status                  = 'expired',
            submitted_at            = now(),
            total_time_used_seconds = $2
      WHERE id = $1 AND status = 'in_progress'
      RETURNING *`,
    [runId, totalTimeSeconds]
  );
  return result.rows[0] ?? null;
}

/**
 * Find `in_progress` runs whose started_at is older than `cutoffHours`.
 * Returns a lightweight shape with both submission ids + started_at so the
 * expiry cron can decide per-row whether to finalize (both tasks done)
 * or mark expired (0 or 1 task submitted).
 */
async function listOverdueInProgress(cutoffHours) {
  const result = await query(
    `SELECT id, user_id, task1_submission_id, task2_submission_id, started_at
       FROM writing_full_tests
      WHERE status = 'in_progress'
        AND started_at < now() - make_interval(hours => $1)
      ORDER BY started_at ASC`,
    [cutoffHours]
  );
  return result.rows;
}

/**
 * Most recent in_progress run for a user — powers the "resume Full Test"
 * banner. Returns null when the user has nothing pending.
 */
async function getInProgressForUser(userId) {
  const result = await query(
    `SELECT ft.*,
            s1.id AS task1_submission_present,
            s2.id AS task2_submission_present
       FROM writing_full_tests ft
       LEFT JOIN writing_submissions s1 ON s1.id = ft.task1_submission_id
       LEFT JOIN writing_submissions s2 ON s2.id = ft.task2_submission_id
      WHERE ft.user_id = $1 AND ft.status = 'in_progress'
      ORDER BY ft.started_at DESC
      LIMIT 1`,
    [userId]
  );
  return result.rows[0] ?? null;
}

async function listForUser(userId, limit = 10, offset = 0) {
  const result = await query(
    `SELECT ft.id, ft.status, ft.started_at, ft.submitted_at,
            ft.total_time_used_seconds, ft.overall_band,
            ft.task1_submission_id, ft.task2_submission_id,
            s1.overall_band AS task1_band,
            s2.overall_band AS task2_band
       FROM writing_full_tests ft
       LEFT JOIN writing_submissions s1 ON s1.id = ft.task1_submission_id
       LEFT JOIN writing_submissions s2 ON s2.id = ft.task2_submission_id
      WHERE ft.user_id = $1
      ORDER BY ft.started_at DESC
      LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
}

module.exports = {
  createRun,
  getRunById,
  linkSubmission,
  finalizeRun,
  markExpired,
  listForUser,
  listOverdueInProgress,
  getInProgressForUser,
};
