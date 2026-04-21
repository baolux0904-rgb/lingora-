/**
 * Migration 0028 — Approve all seeded reading passages.
 *
 * The seed scripts insert passages with review_status = 'pending' so content
 * can be QA-gated. All ~56 seeded passages have since been reviewed by Louis
 * and are ready for practice/full-test surfaces. Flip them to 'approved' in
 * one transactional UPDATE.
 *
 * Down migration reverts only the rows this migration approved (by id in a
 * temp table) would require state capture at up-time. We accept a simpler
 * rollback: revert everything currently 'approved' to 'pending'. This is
 * acceptable because future content should be inserted with 'approved' if
 * already reviewed, or 'pending' if not — and a down migration is an
 * emergency tool, not a routine flow.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    UPDATE reading_passages
       SET review_status = 'approved'
     WHERE review_status = 'pending';
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    UPDATE reading_passages
       SET review_status = 'pending'
     WHERE review_status = 'approved';
  `);
};
