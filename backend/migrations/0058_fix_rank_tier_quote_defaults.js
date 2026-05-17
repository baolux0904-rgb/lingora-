/**
 * 0058_fix_rank_tier_quote_defaults.js
 *
 * Fix rank_tier quote defaults — battle_player_profiles only.
 *
 * Earlier migration 0019_battle_system declared
 *   default: "'iron'"
 * for `battle_player_profiles.current_rank_tier`. node-pg-migrate
 * string-escaped the embedded apostrophes, so the column DEFAULT became
 * the literal seven-char value `'iron'` (with surrounding single quotes
 * baked into the value), not the four-char `iron`.
 *
 * Symptom: Profile page renders rank as `'Iron'` (Title-case of `'iron'`).
 *
 * Note: This migration originally also targeted `battle_season_profiles`,
 * but that table was dropped by migration 0053 (Wave 5.2 cleanup — per-season
 * slicing was never wired). The `battle_season_profiles` operations have
 * been removed to fix a structural bug that prevented this migration from
 * running on any fresh DB (PostgreSQL 42P01 relation does not exist).
 * See post-incident analysis in CLAUDE.md.
 *
 * This migration:
 *   1. Corrects the DEFAULT on `battle_player_profiles.current_rank_tier`
 *      to the clean string `iron`.
 *   2. Strips leading/trailing apostrophes from any existing rows that
 *      were stored with the bad default.
 *
 * Idempotent — re-running produces no further changes after rows are clean.
 */

exports.up = (pgm) => {
  pgm.alterColumn("battle_player_profiles", "current_rank_tier", {
    type: "text",
    notNull: true,
    default: "iron",
  });

  pgm.sql(`
    UPDATE battle_player_profiles
       SET current_rank_tier = trim(both '''' from current_rank_tier)
     WHERE current_rank_tier LIKE '''%''';
  `);
};

exports.down = (pgm) => {
  // Intentionally non-reversible — restoring the broken default would
  // recreate the very bug this migration fixes. The data correction
  // (stripping apostrophes) is also irreversible by design.
  pgm.sql("-- no-op: bug fix is not reversed");
};
