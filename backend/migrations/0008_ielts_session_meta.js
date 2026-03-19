/**
 * Migration 0008 — IELTS Session Metadata
 *
 * Adds a `session_meta` JSONB column to `scenario_sessions` for persistent
 * IELTS exam state (part, phase, cue card index, question index).
 *
 * Previously stored in an in-memory Map — lost on server restart.
 * Now persisted in the database — survives restarts, safe for multi-process.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn("scenario_sessions", {
    session_meta: {
      type: "jsonb",
      default: pgm.func("'{}'::jsonb"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("scenario_sessions", "session_meta");
};
