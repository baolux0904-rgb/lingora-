"use strict";

/**
 * lib/usernameHelper.js — Username validation + autogeneration.
 *
 * Wave 6 Sprint 3B. Centralizes the username format rules already enforced
 * at the DB layer (migration 0016 partial UNIQUE, 0049 cooldown table)
 * so service layer + controllers share one source of truth.
 *
 * Format: 3-30 chars, [a-zA-Z0-9_] only. Storage is case-preserving;
 * uniqueness check is case-insensitive (controller LOWER()s before lookup).
 *
 * Autogen pattern: emailPrefix_<6-char base36>. E.g.
 *   louis@gmail.com  → louis_a3b8x9
 *   nguyễn@x.com     → nguyn_kd91zp   (diacritics stripped, lowercased)
 *   x@y.com          → x_qz31a4
 *   junk@domain      → user_kd91zp    (fallback when prefix invalid)
 *
 * Used by:
 *   - authController.register (validation only)
 *   - authService.googleAuth (autogen for OAuth signups)
 *   - publicController.usernameAvailability (validation only)
 */

const VALID_USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

/** Sanitize an email's local-part into a username-safe base. */
function emailPrefixToBase(email) {
  const prefix = String(email || "").split("@")[0] || "";
  // Lowercase + drop everything outside [a-z0-9_]. Truncate to 23 chars
  // to leave room for `_xxxxxx` (1 + 6) suffix without exceeding 30.
  const cleaned = prefix.toLowerCase().replace(/[^a-z0-9_]/g, "");
  return cleaned.slice(0, 23) || "user";
}

/** 6-char base36 random suffix. */
function randomSuffix() {
  return Math.random().toString(36).slice(2, 8).padStart(6, "0");
}

/**
 * Generate a unique username from an email address.
 * Retries up to 5 times against the supplied existence checker; falls back
 * to a timestamp-based username if all retries collide (vanishingly rare).
 *
 * @param {string} email
 * @param {(candidate: string) => Promise<boolean>} checkExists
 *        Called with each candidate; should return true if already taken.
 * @returns {Promise<string>}
 */
async function autogenUsername(email, checkExists) {
  const base = emailPrefixToBase(email);
  for (let i = 0; i < 5; i++) {
    const candidate = `${base}_${randomSuffix()}`;
    if (!VALID_USERNAME_RE.test(candidate)) continue;
    // eslint-disable-next-line no-await-in-loop
    const taken = await checkExists(candidate);
    if (!taken) return candidate;
  }
  // Last-resort fallback — timestamp tail is monotonic so dups are essentially
  // impossible across requests on the same process.
  return `user_${Date.now().toString(36).slice(-8)}`;
}

module.exports = {
  VALID_USERNAME_RE,
  emailPrefixToBase,
  randomSuffix,
  autogenUsername,
};
