/* eslint-disable camelcase */

/**
 * Migration 0030 — Expand reading_questions.type enum (batch 2).
 *
 * After 0029 we covered: mcq, tfng, matching, ynng, matching_headings,
 * sentence_completion, summary_completion (7).
 *
 * Added here:
 *   matching_information
 *   matching_features
 *   matching_sentence_endings
 *   note_table_diagram_completion
 *   short_answer
 *
 * Final enum (12 types):
 *   mcq, tfng, matching, ynng, matching_headings, sentence_completion,
 *   summary_completion, matching_information, matching_features,
 *   matching_sentence_endings, note_table_diagram_completion, short_answer
 *
 * Payload shapes (stored in reading_questions.options jsonb):
 *
 *   matching_information:
 *     options = {
 *       statements: [{ id: "s1", text: "..." }, ...],
 *       paragraph_labels: ["A", "B", "C", ...],
 *       correct_mapping: { s1: "A", s2: "C", s3: "A", ... }   // reuse OK
 *     }
 *     correct_answer = JSON.stringify(correct_mapping)
 *     Scoring: 1 point per correctly placed statement.
 *
 *   matching_features:
 *     options = {
 *       features: [{ letter: "A", text: "..." }, ...],
 *       items:    [{ id: "i1", text: "..." }, ...],
 *       correct_mapping: { i1: "A", i2: "B", ... },
 *       allow_reuse: false   // optional, defaults false
 *     }
 *     correct_answer = JSON.stringify(correct_mapping)
 *     Scoring: 1 point per correctly placed item.
 *
 *   matching_sentence_endings:
 *     options = {
 *       sentence_starts: [{ id: "s1", text: "Although the experiment..." }, ...],
 *       endings:         [{ letter: "A", text: "..." }, ...],   // distractors expected
 *       correct_mapping: { s1: "C", s2: "A", ... }
 *     }
 *     correct_answer = JSON.stringify(correct_mapping)
 *     Scoring: 1 point per correctly matched start.
 *
 *   note_table_diagram_completion:
 *     options = {
 *       format: "note" | "table" | "diagram",
 *       structure: <format-specific, see below>,
 *       blanks: [{ id: "b1", correct_answers: ["..."], max_words: N }, ...]
 *     }
 *     - note: structure = string with {{b1}} {{b2}} markers
 *     - table: structure = { rows: string[][] } where any cell containing
 *       "{{bN}}" becomes an input
 *     - diagram: structure = { image_url: string, caption?: string } and
 *       blanks are listed below the image (no overlay positioning yet)
 *     correct_answer = first blank's first accepted answer (NOT NULL stub)
 *     Scoring: per-blank, case-insensitive trim, max_words enforced.
 *
 *   short_answer:
 *     options = {
 *       questions: [
 *         { id: "q1", question_text: "Where did X happen?",
 *           max_words: 3, correct_answers: ["in the lab", "lab"] },
 *         ...
 *       ]
 *     }
 *     correct_answer = first question's first accepted answer (NOT NULL stub)
 *     Scoring: per-sub-question, case-insensitive trim, max_words enforced.
 *
 * No data migration — only the CHECK constraint is replaced.
 */

exports.shorthands = undefined;

const ALL_TYPES = [
  "mcq",
  "tfng",
  "matching",
  "ynng",
  "matching_headings",
  "sentence_completion",
  "summary_completion",
  "matching_information",
  "matching_features",
  "matching_sentence_endings",
  "note_table_diagram_completion",
  "short_answer",
];

const PREV_TYPES = [
  "mcq",
  "tfng",
  "matching",
  "ynng",
  "matching_headings",
  "sentence_completion",
  "summary_completion",
];

const quoted = (arr) => arr.map((t) => `'${t}'`).join(", ");

exports.up = (pgm) => {
  pgm.dropConstraint("reading_questions", "reading_questions_type_check");
  pgm.addConstraint("reading_questions", "reading_questions_type_check", {
    check: `type IN (${quoted(ALL_TYPES)})`,
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint("reading_questions", "reading_questions_type_check");
  pgm.addConstraint("reading_questions", "reading_questions_type_check", {
    check: `type IN (${quoted(PREV_TYPES)})`,
  });
};
