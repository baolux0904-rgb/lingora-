"use strict";

/**
 * domain/analyticsGuard.js
 *
 * Pure validation + sanitisation for the analytics ingest path. No DB,
 * no I/O. Two jobs:
 *
 *   1. Reject events that carry PII keys outright. Better to drop the
 *      event than to store an email or phone number under the analytics
 *      table's relaxed retention.
 *   2. Sanitise everything else so a single pathological caller cannot
 *      blow up storage: cap key count, truncate long strings, and bound
 *      the serialised size of the whole properties object.
 *
 * The function returns { ok: true, properties } on success, or
 * { ok: false, code, message } when the caller should be rejected with
 * 400. Callers do not throw — controllers translate the result into a
 * structured HTTP response.
 */

const FORBIDDEN_KEYS = Object.freeze(new Set([
  "email", "password", "phone", "address", "full_name", "fullname", "fullName",
  "dob", "date_of_birth", "dateOfBirth", "ssn", "passport",
]));

const MAX_EVENT_NAME_LEN  = 100;
const MAX_SESSION_ID_LEN  = 200;
const MAX_KEYS            = 50;
const MAX_STRING_VALUE_LEN = 1024;          // 1 KB per string value
const MAX_PROPERTIES_BYTES = 10 * 1024;     // 10 KB serialised total

function validateEventName(name) {
  if (typeof name !== "string") return { ok: false, code: "INVALID_EVENT_NAME", message: "event_name must be a string" };
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, code: "INVALID_EVENT_NAME", message: "event_name required" };
  if (trimmed.length > MAX_EVENT_NAME_LEN) {
    return { ok: false, code: "EVENT_NAME_TOO_LONG", message: `event_name max ${MAX_EVENT_NAME_LEN} chars` };
  }
  return { ok: true, value: trimmed };
}

function validateSessionId(sid) {
  if (typeof sid !== "string") return { ok: false, code: "INVALID_SESSION_ID", message: "session_id must be a string" };
  const trimmed = sid.trim();
  if (!trimmed) return { ok: false, code: "INVALID_SESSION_ID", message: "session_id required" };
  if (trimmed.length > MAX_SESSION_ID_LEN) {
    return { ok: false, code: "SESSION_ID_TOO_LONG", message: `session_id max ${MAX_SESSION_ID_LEN} chars` };
  }
  return { ok: true, value: trimmed };
}

/**
 * Validate + sanitise properties.
 * Returns { ok: true, properties } or { ok: false, code, message }.
 */
function sanitiseProperties(input) {
  if (input == null) return { ok: true, properties: {} };
  if (typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, code: "INVALID_PROPERTIES", message: "properties must be an object" };
  }

  const keys = Object.keys(input);
  if (keys.length > MAX_KEYS) {
    return { ok: false, code: "TOO_MANY_KEYS", message: `properties max ${MAX_KEYS} keys` };
  }

  const sanitised = {};
  for (const k of keys) {
    if (FORBIDDEN_KEYS.has(k) || FORBIDDEN_KEYS.has(k.toLowerCase())) {
      return { ok: false, code: "PII_REJECTED", message: `properties may not contain '${k}'` };
    }
    const v = input[k];
    if (typeof v === "string" && v.length > MAX_STRING_VALUE_LEN) {
      sanitised[k] = v.slice(0, MAX_STRING_VALUE_LEN);
    } else {
      sanitised[k] = v;
    }
  }

  // Final size guard — caller might pack many small values that together
  // blow the JSONB row size. Fail loud rather than silently truncate.
  const serialised = JSON.stringify(sanitised);
  if (Buffer.byteLength(serialised, "utf8") > MAX_PROPERTIES_BYTES) {
    return { ok: false, code: "PROPERTIES_TOO_LARGE", message: `properties max ${MAX_PROPERTIES_BYTES} bytes serialised` };
  }

  return { ok: true, properties: sanitised };
}

module.exports = Object.freeze({
  FORBIDDEN_KEYS,
  MAX_EVENT_NAME_LEN,
  MAX_SESSION_ID_LEN,
  MAX_KEYS,
  MAX_STRING_VALUE_LEN,
  MAX_PROPERTIES_BYTES,
  validateEventName,
  validateSessionId,
  sanitiseProperties,
});
