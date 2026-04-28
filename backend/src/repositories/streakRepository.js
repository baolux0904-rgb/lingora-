/**
 * repositories/streakRepository.js
 *
 * Raw SQL for the user_streaks table.
 * One row per user; upserted on every lesson completion.
 *
 * All date comparisons use the Asia/Ho_Chi_Minh timezone — streaks are
 * calendar-day based for VN learners, not UTC.
 */

const { query } = require('../config/db');

/**
 * getVietnamToday
 *
 * Returns the current calendar date in Asia/Ho_Chi_Minh, plus the number of
 * seconds until VN local midnight. Used as the single source of truth for
 * "today" across streak logic and the FE warning banner.
 *
 * @returns {Promise<{ today_vn: string, seconds_until_midnight: number }>}
 *   today_vn formatted as 'YYYY-MM-DD'.
 */
async function getVietnamToday() {
  const result = await query(
    `SELECT to_char((now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date, 'YYYY-MM-DD')
              AS today_vn,
            GREATEST(0, EXTRACT(EPOCH FROM (
              (date_trunc('day', now() AT TIME ZONE 'Asia/Ho_Chi_Minh')
                + interval '1 day')
              - (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')
            ))::int) AS seconds_until_midnight`,
  );
  return result.rows[0];
}

/**
 * getStreak
 *
 * Returns the streak row for a user, or null if the user has never
 * completed a lesson. last_activity_at is cast to text 'YYYY-MM-DD' so
 * callers always receive a stable string regardless of pg DATE parsing.
 *
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
async function getStreak(userId) {
  const result = await query(
    `SELECT user_id,
            current_streak,
            longest_streak,
            to_char(last_activity_at, 'YYYY-MM-DD') AS last_activity_at
     FROM   user_streaks
     WHERE  user_id = $1`,
    [userId],
  );
  return result.rows[0] ?? null;
}

/**
 * upsertStreak
 *
 * Inserts a new streak row or replaces all three mutable fields
 * for an existing one.
 *
 * @param {string} userId
 * @param {number} currentStreak
 * @param {number} longestStreak
 * @param {string} lastActivityAt - 'YYYY-MM-DD' VN local date string
 * @returns {Promise<object>} the upserted row (last_activity_at as 'YYYY-MM-DD' text)
 */
async function upsertStreak(userId, currentStreak, longestStreak, lastActivityAt) {
  const result = await query(
    `INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE
       SET current_streak   = EXCLUDED.current_streak,
           longest_streak   = EXCLUDED.longest_streak,
           last_activity_at = EXCLUDED.last_activity_at
     RETURNING user_id,
               current_streak,
               longest_streak,
               to_char(last_activity_at, 'YYYY-MM-DD') AS last_activity_at`,
    [userId, currentStreak, longestStreak, lastActivityAt],
  );
  return result.rows[0];
}

module.exports = { getVietnamToday, getStreak, upsertStreak };
