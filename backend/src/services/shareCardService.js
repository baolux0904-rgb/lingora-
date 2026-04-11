/**
 * services/shareCardService.js
 *
 * Aggregates user stats for share card generation.
 */

"use strict";

const { query } = require("../config/db");

async function getShareCardStats(userId) {
  const [streakRow, weeklyXpRow, totalXpRow, weeklySessionsRow, weeklyWritingRow, latestBandRow, userRow] =
    await Promise.all([
      query(`SELECT current_streak FROM user_streaks WHERE user_id = $1`, [userId]),
      query(
        `SELECT COALESCE(SUM(delta), 0)::int AS xp FROM xp_ledger
          WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'`,
        [userId]
      ),
      query(`SELECT COALESCE(SUM(delta), 0)::int AS xp FROM xp_ledger WHERE user_id = $1`, [userId]),
      query(
        `SELECT COUNT(*)::int AS count FROM scenario_sessions
          WHERE user_id = $1 AND started_at >= CURRENT_DATE - INTERVAL '7 days'`,
        [userId]
      ),
      query(
        `SELECT COUNT(*)::int AS count FROM writing_submissions
          WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'`,
        [userId]
      ),
      query(
        `SELECT overall_band FROM writing_submissions
          WHERE user_id = $1 AND status = 'completed' AND overall_band IS NOT NULL
          ORDER BY created_at DESC LIMIT 1`,
        [userId]
      ),
      query(`SELECT name FROM users WHERE id = $1`, [userId]),
    ]);

  // Compute level from total XP
  const totalXp = totalXpRow.rows[0]?.xp ?? 0;
  const THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];
  let level = 1;
  for (let i = THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= THRESHOLDS[i]) { level = i + 1; break; }
  }

  return {
    displayName: userRow.rows[0]?.name || "Learner",
    streak: streakRow.rows[0]?.current_streak ?? 0,
    weeklyXp: weeklyXpRow.rows[0]?.xp ?? 0,
    totalXp,
    weeklyRank: null, // Would need leaderboard service — skip for MVP
    speakingSessionsThisWeek: weeklySessionsRow.rows[0]?.count ?? 0,
    writingTasksThisWeek: weeklyWritingRow.rows[0]?.count ?? 0,
    predictedBand: latestBandRow.rows[0]?.overall_band ? Number(latestBandRow.rows[0].overall_band) : null,
    level,
  };
}

async function generateShareCard(userId, templateKey, triggerType) {
  const stats = await getShareCardStats(userId);
  const result = await query(
    `INSERT INTO share_card_generations (user_id, template_key, stats_snapshot, trigger_type)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, templateKey, JSON.stringify(stats), triggerType || null]
  );
  return { id: result.rows[0].id, templateKey, statsSnapshot: stats };
}

async function getHistory(userId, limit = 10) {
  const result = await query(
    `SELECT * FROM share_card_generations WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

module.exports = { getShareCardStats, generateShareCard, getHistory };
