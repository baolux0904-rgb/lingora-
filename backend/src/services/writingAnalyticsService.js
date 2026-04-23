/**
 * services/writingAnalyticsService.js
 *
 * Time-series + self-compare aggregation over writing_submissions for
 * the Writing progress page and the result-screen mini banner.
 *
 * Trend endpoint groups submissions by day and returns one series per
 * breakdown kind (overall / criteria / by_task). Self-compare diffs the
 * user's current-month average against the previous month.
 *
 * Both shapes are tiny and re-compute fast; handler layer adds private
 * Cache-Control headers so browsers don't re-fetch on every nav.
 */

"use strict";

const { query } = require("../config/db");

const RANGE_DAYS = { "7d": 7, "30d": 30, "90d": 90 };

function rangeDays(range) {
  return RANGE_DAYS[range] ?? 30;
}

/**
 * Per-day time series for the authenticated user's completed submissions.
 *
 * @param {string} userId
 * @param {'7d'|'30d'|'90d'} range
 * @param {'overall'|'criteria'|'by_task'} breakdown
 * @returns {Promise<{range: string, breakdown: string, points: object[]}>}
 */
async function getTrend(userId, range, breakdown) {
  const days = rangeDays(range);

  let selectCols;
  switch (breakdown) {
    case "criteria":
      selectCols = `
        AVG(task_score)      ::numeric(3,1) AS task_achievement,
        AVG(coherence_score) ::numeric(3,1) AS coherence,
        AVG(lexical_score)   ::numeric(3,1) AS lexical,
        AVG(grammar_score)   ::numeric(3,1) AS grammar
      `;
      break;
    case "by_task":
      selectCols = `
        AVG(overall_band) FILTER (WHERE task_type = 'task1')::numeric(3,1) AS task1_band,
        AVG(overall_band) FILTER (WHERE task_type = 'task2')::numeric(3,1) AS task2_band
      `;
      break;
    case "overall":
    default:
      selectCols = `AVG(overall_band)::numeric(3,1) AS overall_band`;
      break;
  }

  const result = await query(
    `SELECT DATE_TRUNC('day', created_at)::date AS date, ${selectCols}
       FROM writing_submissions
      WHERE user_id = $1
        AND status = 'completed'
        AND overall_band IS NOT NULL
        AND created_at >= (now() - ($2 || ' days')::interval)
      GROUP BY 1
      ORDER BY 1 ASC`,
    [userId, String(days)]
  );

  // Coerce numeric strings to numbers for the JSON payload.
  const points = result.rows.map((row) => {
    const out = { date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : row.date };
    for (const [k, v] of Object.entries(row)) {
      if (k === "date") continue;
      out[k] = v == null ? null : Number(v);
    }
    return out;
  });

  return { range, breakdown, days, points };
}

/**
 * Month-over-month self-comparison. Returns the current calendar
 * month's avg overall band vs the previous calendar month's, plus
 * submission counts for each window.
 */
async function getSelfCompare(userId) {
  const result = await query(
    `SELECT
        AVG(overall_band) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', now()))               ::numeric(3,1) AS current_month_avg,
        AVG(overall_band) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', now() - interval '1 month'))::numeric(3,1) AS previous_month_avg,
        COUNT(*)          FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', now()))                AS current_count,
        COUNT(*)          FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', now() - interval '1 month')) AS previous_count
       FROM writing_submissions
      WHERE user_id = $1
        AND status = 'completed'
        AND overall_band IS NOT NULL`,
    [userId]
  );

  const row = result.rows[0];
  const current = row.current_month_avg == null ? null : Number(row.current_month_avg);
  const previous = row.previous_month_avg == null ? null : Number(row.previous_month_avg);
  const delta =
    current != null && previous != null
      ? Math.round((current - previous) * 10) / 10
      : null;

  return {
    current_month_avg: current,
    previous_month_avg: previous,
    delta,
    submission_count_current: Number(row.current_count),
    submission_count_previous: Number(row.previous_count),
  };
}

module.exports = { getTrend, getSelfCompare };
