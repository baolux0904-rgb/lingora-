/* eslint-disable camelcase */

/**
 * Migration 0045 — Add `source` discriminator to writing_submissions.
 *
 * Why: migration 0021 enforces a per-day UNIQUE on
 *   (user_id, task_type, submission_date) WHERE status != 'failed'
 * to dedupe Practice double-submits. The same constraint silently blocks
 * the Full Test flow: if a user submits a Practice Task 1 in the morning,
 * the afternoon's Full Test Task 1 (entirely different essay content)
 * either gets rejected at the DB level OR — worse — the service-layer
 * `findTodaySubmission` guard returns the morning Practice submission as
 * if it were the Full Test result. The user's Full Test essay is never
 * scored. We called this the "content theft" bug.
 *
 * Fix: add `source` so Practice and Full Test cohabit a calendar day.
 *   - Backfill: any submission referenced by writing_full_tests is
 *     'full_test'; everything else stays 'practice'.
 *   - Index swap: drop the old 3-column unique, create a 4-column
 *     unique that includes `source`.
 *
 * The default 'practice' is safe because both code paths now write
 * the column explicitly — the default only matters for the brief
 * window between this migration and the deploy of the calling code,
 * during which all in-flight inserts ARE practice (Full Test traffic
 * is rejected by the old index until the new index is in place; the
 * new index is created in this migration before the new code ships,
 * so there is no live overlap window).
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // 1. Add the discriminator with a safe default.
  pgm.addColumns("writing_submissions", {
    source: {
      type: "varchar(20)",
      notNull: true,
      default: "practice",
    },
  });

  // 2. CHECK constraint — only the two values we ship today.
  pgm.addConstraint("writing_submissions", "writing_submissions_source_check", {
    check: "source IN ('practice','full_test')",
  });

  // 3. Backfill: any submission linked from a writing_full_tests row is a
  //    Full Test submission. Everything else keeps the 'practice' default.
  pgm.sql(`
    UPDATE writing_submissions ws
       SET source = 'full_test'
      FROM writing_full_tests wft
     WHERE ws.id IN (wft.task1_submission_id, wft.task2_submission_id);
  `);

  // 4. Swap the unique index so (user, task_type, day, source) defines
  //    a slot. Old name kept for diff readability; the new index gets a
  //    distinct name so the DROP/CREATE is unambiguous.
  pgm.sql(`DROP INDEX IF EXISTS idx_writing_submissions_user_type_day;`);
  pgm.createIndex(
    "writing_submissions",
    ["user_id", "task_type", "submission_date", "source"],
    {
      name: "idx_writing_submissions_user_type_day_source",
      unique: true,
      where: "status != 'failed'",
    },
  );
};

exports.down = (pgm) => {
  pgm.sql(`DROP INDEX IF EXISTS idx_writing_submissions_user_type_day_source;`);
  // Restore the original 3-column unique so a roll-back leaves the schema
  // exactly how 0021 left it.
  pgm.createIndex(
    "writing_submissions",
    ["user_id", "task_type", "submission_date"],
    {
      name: "idx_writing_submissions_user_type_day",
      unique: true,
      where: "status != 'failed'",
    },
  );
  pgm.dropConstraint("writing_submissions", "writing_submissions_source_check");
  pgm.dropColumns("writing_submissions", ["source"]);
};
