/* eslint-disable camelcase */

/**
 * Migration 0022 — Pro trial support
 *
 * Adds trial_expires_at to users for 3-day free trial tracking.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("users", {
    trial_expires_at: { type: "timestamptz" },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("users", ["trial_expires_at"]);
};
