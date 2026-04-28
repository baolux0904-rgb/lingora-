/**
 * domain/limits.js
 *
 * Single source of truth for free/pro daily quotas. Pure data — no DB,
 * no env, no I/O. The audit found three sources of truth (proController,
 * config, FE marketing copy) drifting apart for Speaking ("3" displayed
 * vs "1" enforced). This module ends that.
 *
 * Reads:
 *   - proController       — to advertise limits in /users/pro/status
 *   - publicController    — to feed the landing PricingSection
 *   - config/index.js     — `speakingDailyLimit`/`writingDailyLimit` are
 *     now thin wrappers over getLimit('free', 'speaking|writing').perDay
 *     (env vars still override for ops sandboxing)
 *   - limitService        — kept reading config for now (Wave 5 cleanup
 *     swaps to direct domain reads)
 *
 * IELTS skill keys (all four reserved so the shape is stable when
 * Listening ships in Phase 1B.2):
 *   - speaking, writing, reading, grammar, listening
 *
 * `perDay: null` means "unlimited" (Pro / free period / unmetered skill).
 */

"use strict";

const LIMITS = Object.freeze({
  free: Object.freeze({
    speaking:  Object.freeze({ perDay: 1 }),
    writing:   Object.freeze({ perDay: 1 }),
    grammar:   Object.freeze({ perDay: null }),
    reading:   Object.freeze({ perDay: null }),
    // Listening feature is paused (Phase 1B.2). Reserve the key so future
    // gating code reads from the same shape. No enforcement today.
    listening: Object.freeze({ perDay: null }),
  }),
  pro: Object.freeze({
    speaking:  Object.freeze({ perDay: null }),
    writing:   Object.freeze({ perDay: null }),
    grammar:   Object.freeze({ perDay: null }),
    reading:   Object.freeze({ perDay: null }),
    listening: Object.freeze({ perDay: null }),
  }),
});

const VALID_PLANS  = Object.freeze(["free", "pro"]);
const VALID_SKILLS = Object.freeze(["speaking", "writing", "grammar", "reading", "listening"]);

/**
 * Get the limit object for a (plan, skill) pair.
 * Returns null when either argument is unknown.
 *
 * @param {'free'|'pro'} plan
 * @param {'speaking'|'writing'|'grammar'|'reading'|'listening'} skill
 * @returns {{ perDay: number|null }|null}
 */
function getLimit(plan, skill) {
  if (!VALID_PLANS.includes(plan)) return null;
  if (!VALID_SKILLS.includes(skill)) return null;
  return LIMITS[plan][skill];
}

/**
 * @returns {boolean} true when the (plan, skill) is unmetered.
 */
function isUnlimited(plan, skill) {
  const limit = getLimit(plan, skill);
  return limit?.perDay == null;
}

/**
 * PUBLIC_LIMITS — the shape served by GET /api/v1/public/limits and
 * mirrored on the FE as a fallback. Listening is intentionally OMITTED
 * from this surface (no marketing copy advertises listening yet).
 */
const PUBLIC_LIMITS = Object.freeze({
  free: Object.freeze({
    speaking: LIMITS.free.speaking.perDay,
    writing:  LIMITS.free.writing.perDay,
    grammar:  LIMITS.free.grammar.perDay,
    reading:  LIMITS.free.reading.perDay,
  }),
  pro: Object.freeze({
    speaking: LIMITS.pro.speaking.perDay,
    writing:  LIMITS.pro.writing.perDay,
    grammar:  LIMITS.pro.grammar.perDay,
    reading:  LIMITS.pro.reading.perDay,
  }),
});

module.exports = {
  LIMITS,
  PUBLIC_LIMITS,
  VALID_PLANS,
  VALID_SKILLS,
  getLimit,
  isUnlimited,
};
