/**
 * utils/sanitize.js
 *
 * Strips answer-key fields from question rows before sending pre-submit
 * payloads to clients. Used by Reading and Battle repositories to wrap
 * `getPassageWithQuestions` outputs into safe DTOs for exam endpoints.
 *
 * What gets stripped (case-insensitive, at every nesting depth):
 *   - correct_*           (correct_answer, correct_mapping, correct_answers)
 *   - explanation         (post-submit only — must not appear in pre-submit GETs)
 *   - acceptable_answers  (server-side scoring helper, not for clients)
 *
 * The function is pure and immutable: callers receive new objects/arrays;
 * input rows are not mutated. Server-side scoring paths that legitimately
 * need the full row (e.g. readingScoring.scoreSubmission, battleService
 * scoreSubmission) MUST NOT pass through here — they take the raw repo
 * output directly.
 */

"use strict";

const EXACT_SENSITIVE_KEYS = new Set(["explanation", "acceptable_answers"]);
const CORRECT_PREFIX_RE = /^correct_/i;

function isSensitiveKey(key) {
  return EXACT_SENSITIVE_KEYS.has(key) || CORRECT_PREFIX_RE.test(key);
}

/**
 * Recursively returns a deep copy of `value` with sensitive keys removed
 * at every object level. Arrays are mapped element-wise; primitives are
 * returned as-is. Date and Buffer instances are passed through untouched
 * to avoid serializer breakage.
 */
function stripSensitive(value) {
  if (Array.isArray(value)) {
    return value.map(stripSensitive);
  }
  if (
    value !== null &&
    typeof value === "object" &&
    !(value instanceof Date) &&
    !(value instanceof Buffer)
  ) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (isSensitiveKey(k)) continue;
      out[k] = stripSensitive(v);
    }
    return out;
  }
  return value;
}

/**
 * sanitizeQuestionsForExam
 *
 * @param {Array<object>} questions - raw question rows from the repository
 * @returns {Array<object>} new array with answer-key fields stripped
 */
function sanitizeQuestionsForExam(questions) {
  if (!Array.isArray(questions)) return [];
  return questions.map((q) =>
    q && typeof q === "object" ? stripSensitive(q) : q,
  );
}

module.exports = { sanitizeQuestionsForExam, stripSensitive, isSensitiveKey };
