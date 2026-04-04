/**
 * Migration 0012 — Rename scenario_sessions columns to match repository code
 *
 * The original migration 0006 created columns named:
 *   coach_feedback, turn_count, word_count
 *
 * But the repository code (scenarioRepository.js) writes to:
 *   feedback_summary, total_turns, total_user_words
 *
 * This mismatch causes a 500 error on every scenario endSession call.
 * This migration renames the columns to match the code.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.renameColumn("scenario_sessions", "coach_feedback", "feedback_summary");
  pgm.renameColumn("scenario_sessions", "turn_count", "total_turns");
  pgm.renameColumn("scenario_sessions", "word_count", "total_user_words");
};

exports.down = (pgm) => {
  pgm.renameColumn("scenario_sessions", "feedback_summary", "coach_feedback");
  pgm.renameColumn("scenario_sessions", "total_turns", "turn_count");
  pgm.renameColumn("scenario_sessions", "total_user_words", "word_count");
};
