/**
 * services/streakService.js
 *
 * Streak update and retrieval logic.
 * Streaks are calendar-day based in Asia/Ho_Chi_Minh (VN local time).
 *
 * Why VN local: 7 prod users are all in Vietnam. Computing dates in UTC
 * caused two bugs:
 *   1. Practice 22h-01h VN spans two VN days but one UTC day
 *      → counted as a single streak day.
 *   2. Practice 06h-08h VN both fall on the same VN day but cross UTC
 *      midnight (23h UTC → 01h UTC) → counted as two streak days.
 *
 * Rules (now in VN local time):
 *   - First ever activity        → streak = 1
 *   - Activity on the SAME VN day → no change (idempotent)
 *   - Activity on the NEXT VN day → streak + 1
 *   - Activity after a gap        → streak resets to 1
 */

const {
  getStreak,
  upsertStreak,
  getVietnamToday,
} = require('../repositories/streakRepository');

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * updateStreak
 *
 * Called after every lesson completion for an authenticated user.
 * Returns the updated streak values plus a `changed` flag that indicates
 * whether the streak counter was actually incremented (used by badgeService
 * to avoid redundant badge checks on same-day repeat completions).
 *
 * @param {string} userId
 * @returns {Promise<{
 *   currentStreak:  number,
 *   longestStreak:  number,
 *   lastActivityAt: string,
 *   changed:        boolean,
 * }>}
 */
async function updateStreak(userId) {
  const [{ today_vn: today }, existing] = await Promise.all([
    getVietnamToday(),
    getStreak(userId),
  ]);

  // ── No existing row: first-ever lesson ──────────────────────────────────
  if (!existing) {
    const row = await upsertStreak(userId, 1, 1, today);
    return {
      currentStreak:  row.current_streak,
      longestStreak:  row.longest_streak,
      lastActivityAt: row.last_activity_at,
      changed:        true,
    };
  }

  // ── Already logged activity today (VN) — no change ───────────────────────
  const lastDate = existing.last_activity_at; // 'YYYY-MM-DD' (VN)
  if (lastDate === today) {
    return {
      currentStreak:  existing.current_streak,
      longestStreak:  existing.longest_streak,
      lastActivityAt: existing.last_activity_at,
      changed:        false,
    };
  }

  // ── Compute new streak based on day gap ──────────────────────────────────
  // Both strings are 'YYYY-MM-DD' → Date parses as UTC midnight; subtraction
  // gives an exact whole-day diff regardless of host TZ.
  const diffMs   = new Date(today) - new Date(lastDate);
  const diffDays = Math.round(diffMs / 86_400_000);

  const newStreak  = diffDays === 1 ? existing.current_streak + 1 : 1;
  const newLongest = Math.max(existing.longest_streak, newStreak);

  const row = await upsertStreak(userId, newStreak, newLongest, today);
  return {
    currentStreak:  row.current_streak,
    longestStreak:  row.longest_streak,
    lastActivityAt: row.last_activity_at,
    changed:        true,
  };
}

/**
 * getStreakSummary
 *
 * Returns streak information for a user (safe to call with no prior activity).
 *
 * Important: if the user's last activity was more than 1 VN-day ago, the
 * streak is broken and we return 0 — even though the DB still holds the old
 * value. The DB value only resets on the NEXT activity (via updateStreak).
 *
 * todayVn + secondsUntilVnMidnight are returned so the FE warning banner can
 * render without doing local-time math (browser TZ may not be Asia/Ho_Chi_Minh).
 *
 * @param {string} userId
 * @returns {Promise<{
 *   currentStreak:           number,
 *   longestStreak:           number,
 *   lastActivityAt:          string|null,
 *   todayVn:                 string,
 *   secondsUntilVnMidnight:  number,
 * }>}
 */
async function getStreakSummary(userId) {
  const [{ today_vn, seconds_until_midnight }, row] = await Promise.all([
    getVietnamToday(),
    getStreak(userId),
  ]);

  if (!row) {
    return {
      currentStreak:          0,
      longestStreak:          0,
      lastActivityAt:         null,
      todayVn:                today_vn,
      secondsUntilVnMidnight: seconds_until_midnight,
    };
  }

  // Streak is alive if last activity was today (0) or yesterday (1) in VN.
  const diffMs   = new Date(today_vn) - new Date(row.last_activity_at);
  const diffDays = Math.round(diffMs / 86_400_000);
  const streakAlive = diffDays <= 1;

  return {
    currentStreak:          streakAlive ? row.current_streak : 0,
    longestStreak:          row.longest_streak,
    lastActivityAt:         row.last_activity_at,
    todayVn:                today_vn,
    secondsUntilVnMidnight: seconds_until_midnight,
  };
}

module.exports = { updateStreak, getStreakSummary };
