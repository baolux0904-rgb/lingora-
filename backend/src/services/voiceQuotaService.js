"use strict";

/**
 * services/voiceQuotaService.js
 *
 * Daily voice-note upload quota — sums bytes uploaded by a user today
 * (Asia/Ho_Chi_Minh day boundary, consistent with the streak fix in
 * Wave 2.1) and rejects sends that would push the total past the
 * plan's perDayBytes ceiling.
 *
 * Pro / trial-active users are unlimited (VOICE_QUOTA.pro = null).
 *
 * NULL voice_file_size_bytes rows from before migration 0051 are
 * treated as zero usage by the SUM — acceptable; the install base
 * is 7 prod users and the gap is one-time.
 */

const { query } = require("../config/db");
const { getVoiceQuota } = require("../domain/limits");

/** Sum of voice bytes sent by `userId` since the start of today (VN tz). */
async function getDailyVoiceUsageBytes(userId) {
  const result = await query(
    `SELECT COALESCE(SUM(voice_file_size_bytes), 0)::bigint AS used
       FROM messages
      WHERE sender_id = $1
        AND type = 'voice'
        AND deleted_at IS NULL
        AND created_at >= date_trunc('day', NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh') AT TIME ZONE 'Asia/Ho_Chi_Minh'`,
    [userId]
  );
  // pg returns BIGINT as a string — coerce so callers can do arithmetic.
  return Number(result.rows[0]?.used ?? 0);
}

/** Read the user's plan + active trial flag once, decide free vs pro. */
async function resolvePlan(userId) {
  const result = await query(
    `SELECT is_pro, trial_expires_at FROM users WHERE id = $1`,
    [userId]
  );
  const row = result.rows[0];
  if (!row) return "free";
  const isPro = row.is_pro === true;
  const trialActive = row.trial_expires_at && new Date(row.trial_expires_at) > new Date();
  return isPro || trialActive ? "pro" : "free";
}

/**
 * Check whether sending a voice note of `additionalBytes` would push
 * the user past today's voice-quota ceiling.
 *
 * @param {string} userId
 * @param {number} additionalBytes  size of the about-to-send blob
 * @returns {Promise<{ allowed: boolean, plan: string, usedBytes: number, limitBytes: number|null, remainingBytes: number|null }>}
 */
async function checkVoiceQuota(userId, additionalBytes) {
  const plan = await resolvePlan(userId);
  const quota = getVoiceQuota(plan);
  const limitBytes = quota?.perDayBytes ?? null;

  if (limitBytes == null) {
    return { allowed: true, plan, usedBytes: 0, limitBytes: null, remainingBytes: null };
  }

  const usedBytes = await getDailyVoiceUsageBytes(userId);
  const projected = usedBytes + Number(additionalBytes ?? 0);
  return {
    allowed: projected <= limitBytes,
    plan,
    usedBytes,
    limitBytes,
    remainingBytes: Math.max(0, limitBytes - usedBytes),
  };
}

module.exports = {
  getDailyVoiceUsageBytes,
  checkVoiceQuota,
};
