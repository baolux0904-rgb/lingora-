/* eslint-disable camelcase */

/**
 * Migration 0031 — reading_tests table.
 *
 * A reading_test is a fixed grouping of exactly 3 passages that the user can
 * sit as a single 60-minute Full Test session. Three explicit passage
 * columns (rather than a join table) because IELTS Academic Reading is
 * always-and-only 3 passages — no future-proofing required.
 *
 * difficulty_tier groups tests for the launcher view ("Foundation",
 * "Standard", "Challenge"). passage_*_id references reading_passages with
 * ON DELETE RESTRICT so we never silently break a test by removing one of
 * its passages.
 *
 * No seed data here. See backend/scripts/seedReadingTests.js for a script
 * that picks groupings from the existing approved pool.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("reading_tests", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    title: {
      type: "text",
      notNull: true,
    },
    difficulty_tier: {
      type: "text",
      notNull: true,
      check: "difficulty_tier IN ('foundation', 'standard', 'challenge')",
    },
    passage_1_id: {
      type: "uuid",
      notNull: true,
      references: '"reading_passages"',
      onDelete: "RESTRICT",
    },
    passage_2_id: {
      type: "uuid",
      notNull: true,
      references: '"reading_passages"',
      onDelete: "RESTRICT",
    },
    passage_3_id: {
      type: "uuid",
      notNull: true,
      references: '"reading_passages"',
      onDelete: "RESTRICT",
    },
    created_at: {
      type: "timestamptz",
      default: pgm.func("now()"),
    },
  });

  pgm.createIndex("reading_tests", ["difficulty_tier"], {
    name: "idx_reading_tests_difficulty_tier",
  });

  // Belt-and-braces: a single passage shouldn't appear twice in the same test.
  pgm.addConstraint("reading_tests", "reading_tests_distinct_passages", {
    check: "passage_1_id <> passage_2_id AND passage_1_id <> passage_3_id AND passage_2_id <> passage_3_id",
  });
};

exports.down = (pgm) => {
  pgm.dropTable("reading_tests");
};
