/**
 * domain/usernameValidation.js
 *
 * Pure validators for the public username write path (Wave 2.11). No
 * DB, no I/O. Three checks, in order:
 *
 *   1. Length 3–30.
 *   2. Charset [a-zA-Z0-9_] only. Leading digit ALLOWED (industry
 *      standard — GitHub, Twitter). Leading/trailing underscore
 *      ALLOWED. Consecutive underscores allowed.
 *   3. Reserved-list match. Case-insensitive against an exact-match
 *      Set + a small set of forbidden prefixes (`deleted_*`, `user_*`,
 *      `support_*`).
 *
 * The 3 prefixes serve different defenses:
 *   - `deleted_*`: collision shield for Wave 2.7's anonymized
 *     usernames (`deleted_<8 hex>`).
 *   - `user_*`: collision shield for the auto-generator in
 *     socialService.getOrCreateUsername which produces `<base><4
 *     digits>` — `user_*` doesn't actually overlap with that
 *     pattern, but reserves the obvious-default namespace so we
 *     never confuse "anonymous" / "placeholder" identities later.
 *   - `support_*`: brand impersonation shield (`support_lingona`,
 *     `support_team`, etc.).
 *
 * Output uses an explicit error code so the FE / tests can
 * branch without parsing the message. Messages are user-facing
 * Vietnamese; codes are stable.
 */

"use strict";

const MIN_LEN = 3;
const MAX_LEN = 30;

// Charset only — no leading-digit ban, no underscore-position ban.
const CHARSET_RE = /^[a-zA-Z0-9_]+$/;

const RESERVED_USERNAMES = Object.freeze(new Set([
  // Spec's 14 + brand variants + 7 obvious extras, all lowercase.
  "admin", "support", "lingona", "lingora", "system", "root",
  "api", "help", "contact", "settings", "profile", "login",
  "signup", "terms", "privacy",
  "lintopus", "ielts", "www", "mail", "undefined", "null", "me",
]));

const RESERVED_PREFIXES = Object.freeze([
  "deleted_",   // Wave 2.7 anonymized pattern
  "user_",      // generic placeholder namespace
  "support_",   // brand impersonation defense
]);

/**
 * Case-insensitive reserved check (exact + prefix).
 * @param {string} username
 * @returns {{ reserved: true, kind: 'exact'|'prefix' } | { reserved: false }}
 */
function checkReserved(username) {
  if (typeof username !== "string") return { reserved: false };
  const lower = username.toLowerCase();
  if (RESERVED_USERNAMES.has(lower)) return { reserved: true, kind: "exact" };
  for (const p of RESERVED_PREFIXES) {
    if (lower.startsWith(p)) return { reserved: true, kind: "prefix" };
  }
  return { reserved: false };
}

/**
 * Validate a candidate username. Returns one of:
 *   { valid: true }
 *   { valid: false, errorCode, errorMsg }
 *
 * @param {unknown} username
 */
function validateUsername(username) {
  if (typeof username !== "string") {
    return { valid: false, errorCode: "INVALID_TYPE", errorMsg: "Username phải là chuỗi." };
  }
  if (username.length < MIN_LEN) {
    return { valid: false, errorCode: "TOO_SHORT", errorMsg: `Username phải có ít nhất ${MIN_LEN} ký tự.` };
  }
  if (username.length > MAX_LEN) {
    return { valid: false, errorCode: "TOO_LONG", errorMsg: `Username không được dài hơn ${MAX_LEN} ký tự.` };
  }
  if (!CHARSET_RE.test(username)) {
    return { valid: false, errorCode: "INVALID_CHARS", errorMsg: "Username chỉ chứa chữ cái, số, và dấu gạch dưới." };
  }
  const reserved = checkReserved(username);
  if (reserved.reserved) {
    return {
      valid: false,
      errorCode: reserved.kind === "exact" ? "RESERVED" : "RESERVED_PREFIX",
      errorMsg: "Username này không khả dụng.",
    };
  }
  return { valid: true };
}

module.exports = Object.freeze({
  MIN_LEN,
  MAX_LEN,
  RESERVED_USERNAMES,
  RESERVED_PREFIXES,
  CHARSET_RE,
  checkReserved,
  validateUsername,
});
