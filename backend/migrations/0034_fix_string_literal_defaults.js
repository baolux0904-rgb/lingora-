/* eslint-disable camelcase */

/**
 * Migration 0034 — Fix string-literal column defaults that violate their
 * own CHECK constraints.
 *
 * Root cause: node-pg-migrate's column config treats a `default: "'foo'"`
 * string as a SQL literal and wraps it again, so the stored default
 * becomes the literal "'foo'" (with surrounding single quotes as part of
 * the value). Any INSERT that relies on the default writes the quoted
 * form, which fails the CHECK constraint accepting only bare `foo`.
 *
 * Twelve columns were caught in the scan (see Item 4 report). Each is
 * reset to the correct bare value via raw SQL so node-pg-migrate cannot
 * re-wrap it.
 *
 * DOWN: drops the default entirely rather than restoring the buggy form.
 * Restoring a constraint-violating default would only re-create the
 * original bug, which is the opposite of a reversible migration's job.
 * If a future audit needs to fully round-trip, that is a new migration,
 * not a `migrate:down` — the original defaults were never legitimate.
 *
 * Affected rows: 0. Metadata-only ALTERs; existing data untouched.
 */

exports.shorthands = undefined;

const FIXES = [
  // table, column, correct bare default
  ["battle_match_participants", "status", "active"],
  ["battle_matches", "status", "queued"],
  ["battle_seasons", "status", "upcoming"],
  ["friend_requests", "status", "pending"],
  ["messages", "type", "text"],
  ["reading_passages", "review_status", "pending"],
  ["study_room_goals", "status", "active"],
  ["study_room_members", "role", "member"],
  ["study_room_members", "status", "active"],
  ["study_rooms", "status", "active"],
  ["writing_questions", "review_status", "approved"],
  ["writing_submissions", "status", "pending"],
];

exports.up = (pgm) => {
  for (const [table, column, value] of FIXES) {
    // Raw SQL — pgm.sql does NOT re-wrap string literals, unlike the column
    // config helpers that caused the original bug.
    pgm.sql(`ALTER TABLE ${table} ALTER COLUMN ${column} SET DEFAULT '${value}';`);
  }
};

exports.down = (pgm) => {
  for (const [table, column] of FIXES) {
    pgm.sql(`ALTER TABLE ${table} ALTER COLUMN ${column} DROP DEFAULT;`);
  }
};
