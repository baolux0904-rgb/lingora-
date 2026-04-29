/**
 * domain/usernameChange.js
 *
 * Pure cooldown calculator for the username-change flow (Wave 2.11).
 * No DB, no I/O — accepts the user's `last_username_change_at`
 * timestamp and returns whether the change is permitted now and how
 * many days remain otherwise.
 *
 * Knobs:
 *   COOLDOWN_DAYS       = 30  → time-since-last-change required.
 *   REDIRECT_GRACE_DAYS = 7   → how long the OLD username keeps
 *                                resolving to the user's profile
 *                                after a successful change.
 *
 * NULL semantics: a user who has never changed their username
 * (`last_username_change_at IS NULL`) is allowed regardless of the
 * cooldown. This covers both first-time setters (auto-generated
 * usernames from socialService.getOrCreateUsername) and the 7 prod
 * users whose username column may be NULL.
 */

"use strict";

const COOLDOWN_DAYS = 30;
const REDIRECT_GRACE_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * @param {{ last_username_change_at: Date|string|null|undefined }} user
 * @param {Date} [now] — injectable clock for tests
 * @returns {{ allowed: true } | { allowed: false, retryAfterDays: number }}
 */
function canChangeUsername(user, now = new Date()) {
  const last = user?.last_username_change_at;
  if (last == null) return { allowed: true };

  const lastMs = last instanceof Date ? last.getTime() : Date.parse(last);
  if (!Number.isFinite(lastMs)) {
    // Invalid stored value — fail OPEN so a malformed row doesn't
    // permanently lock the user out. The next successful change
    // overwrites the bad value.
    return { allowed: true };
  }

  const elapsedMs = now.getTime() - lastMs;
  const cooldownMs = COOLDOWN_DAYS * MS_PER_DAY;
  if (elapsedMs >= cooldownMs) return { allowed: true };

  // Round UP — "still need 0.3 days" should display "1 ngày", not "0".
  const retryAfterDays = Math.max(1, Math.ceil((cooldownMs - elapsedMs) / MS_PER_DAY));
  return { allowed: false, retryAfterDays };
}

/**
 * Compute the redirect expiry timestamp for a fresh change.
 * @param {Date} [now] — injectable clock
 * @returns {Date}
 */
function redirectExpiresAt(now = new Date()) {
  return new Date(now.getTime() + REDIRECT_GRACE_DAYS * MS_PER_DAY);
}

module.exports = Object.freeze({
  COOLDOWN_DAYS,
  REDIRECT_GRACE_DAYS,
  canChangeUsername,
  redirectExpiresAt,
});
