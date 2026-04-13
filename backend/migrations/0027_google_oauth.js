/**
 * Migration 0027 — Add google_id column for Google OAuth.
 *
 * Nullable — existing users don't have it.
 * Unique — one Google account per Lingona account.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("users", {
    google_id: {
      type: "varchar(255)",
      unique: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("users", ["google_id"]);
};
