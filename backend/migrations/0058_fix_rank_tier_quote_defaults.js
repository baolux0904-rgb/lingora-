/**
 * 0058_fix_rank_tier_quote_defaults.js
 *
 * Fix: earlier migrations (0019_battle_system, 0053_drop_dead_schema) declared
 *   default: "'iron'"
 * for `battle_player_profiles.current_rank_tier` and
 * `battle_season_profiles.rank_tier`. node-pg-migrate string-escaped the
 * embedded apostrophes, so the column DEFAULT became the literal seven-char
 * value `'iron'` (with surrounding single quotes baked into the value), not
 * the four-char `iron`.
 *
 * Symptom: Profile page renders rank as `'Iron'` (Title-case of `'iron'`).
 *
 * This migration:
 *   1. Corrects the DEFAULT on both columns to the clean string `iron`.
 *   2. Strips leading/trailing apostrophes from any existing rows that were
 *      stored with the bad default.
 *
 * Idempotent — re-running produces no further changes after rows are clean.
 */

exports.up = (pgm) => {
  pgm.alterColumn("battle_player_profiles", "current_rank_tier", {
    type: "text",
    notNull: true,
    default: "iron",
  });
  pgm.alterColumn("battle_season_profiles", "rank_tier", {
    type: "text",
    notNull: true,
    default: "iron",
  });

  pgm.sql(`
    UPDATE battle_player_profiles
       SET current_rank_tier = trim(both '''' from current_rank_tier)
     WHERE current_rank_tier LIKE '''%''';
  `);
  pgm.sql(`
    UPDATE battle_season_profiles
       SET rank_tier = trim(both '''' from rank_tier)
     WHERE rank_tier LIKE '''%''';
  `);
};

exports.down = (pgm) => {
  // Intentionally non-reversible — restoring the broken default would
  // recreate the very bug this migration fixes. The data correction
  // (stripping apostrophes) is also irreversible by design.
  pgm.sql("-- no-op: bug fix is not reversed");
};
