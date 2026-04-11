/* eslint-disable camelcase */

/**
 * Migration 0023 — Onboarding flow support
 *
 * Adds columns to track onboarding completion, target band, and skip state.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("users", {
    has_completed_onboarding: { type: "boolean", notNull: true, default: false },
    target_band: { type: "decimal(3,1)" },
    onboarding_skipped: { type: "boolean", notNull: true, default: false },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("users", ["has_completed_onboarding", "target_band", "onboarding_skipped"]);
};
