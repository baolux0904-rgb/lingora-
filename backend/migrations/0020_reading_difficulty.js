/* eslint-disable camelcase */

/**
 * Migration 0020 — Update reading passage difficulty tiers
 *
 * Replaces the single "band_55_70" difficulty with granular IELTS-aligned tiers:
 *   band_50_55  (IELTS 5.0–5.5)
 *   band_60_65  (IELTS 6.0–6.5)
 *   band_70_80  (IELTS 7.0–8.0)
 *   band_80_plus (IELTS 8.0+)
 *
 * Reclassifies existing passages from "band_55_70" to "band_50_55" (beginner level).
 * Also adds estimated_band column to users for band-aware passage selection.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // 0. Add estimated_band to users (nullable, default null = 5.0 in code)
  pgm.addColumns("users", {
    estimated_band: {
      type: "decimal(3,1)",
    },
  });

  // 1. Drop existing check constraint on difficulty
  pgm.sql(`
    ALTER TABLE reading_passages
      DROP CONSTRAINT IF EXISTS reading_passages_difficulty_check;
  `);

  // 2. Reclassify existing passages BEFORE adding new constraint
  pgm.sql(`
    UPDATE reading_passages
       SET difficulty = 'band_50_55'
     WHERE difficulty = 'band_55_70';
  `);

  // 3. Add new check constraint with updated values
  pgm.sql(`
    ALTER TABLE reading_passages
      ADD CONSTRAINT reading_passages_difficulty_check
      CHECK (difficulty IN ('band_50_55', 'band_60_65', 'band_70_80', 'band_80_plus'));
  `);

  // 4. Update default
  pgm.sql(`
    ALTER TABLE reading_passages
      ALTER COLUMN difficulty SET DEFAULT 'band_50_55';
  `);
};

exports.down = (pgm) => {
  // Remove estimated_band from users
  pgm.dropColumns("users", ["estimated_band"]);

  // Revert to original constraint
  pgm.sql(`
    ALTER TABLE reading_passages
      DROP CONSTRAINT IF EXISTS reading_passages_difficulty_check;
  `);

  pgm.sql(`
    UPDATE reading_passages
       SET difficulty = 'band_55_70'
     WHERE difficulty = 'band_50_55';
  `);

  pgm.sql(`
    ALTER TABLE reading_passages
      ALTER COLUMN difficulty SET DEFAULT 'band_55_70';
  `);
};
