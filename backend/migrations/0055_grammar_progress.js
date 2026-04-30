/* eslint-disable camelcase */

/**
 * Migration 0055 — Grammar progress persistence (Wave 5.4.5).
 *
 * Backs the new server-side Grammar progress tracking. Replaces the
 * pre-Wave-5 localStorage-only state owned by
 * frontend/components/Grammar/useGrammarProgress.ts.
 *
 * Schema:
 *   - type discriminator (lesson | exam) keeps both surfaces in one
 *     table; saves an extra migration vs. two parallel tables when
 *     the access patterns are identical (per-user upsert by id).
 *   - item_id is a FE-defined opaque string (lessonId, unitId,
 *     literal "final"). Curriculum source-of-truth stays in
 *     grammarData.ts; renaming a lesson there will leave orphan
 *     rows here. Acceptable trade-off pre-launch.
 *   - score is the percentage (0..100) plus a CHECK to keep bad
 *     payloads out of the column.
 *   - passed is meaningful only for exam rows; lesson rows leave it
 *     NULL.
 *   - xp_earned snapshots the XP awarded at the moment of the row's
 *     creation (computed by service layer from the FE-locked tiers
 *     at the time of submission). Useful for backfill audit and
 *     potential future replay.
 *   - UNIQUE (user_id, type, item_id) is the idempotent-upsert key.
 *     Replays of the same lesson/exam UPSERT into the same row;
 *     score uses GREATEST() so a higher retake never gets clobbered
 *     by a lower one, and passed uses OR so once-passed stays passed.
 *
 * XP integration:
 *   - awardXp(userId, delta, reason, refId) is the canonical entry
 *     for xp_ledger writes. Reasons added in this wave:
 *       - 'grammar_lesson_complete'   refId = `lesson:${lessonId}`
 *       - 'grammar_exam_complete'     refId = `exam:${unitId}`
 *   - Migration 0041's UNIQUE (user_id, reason, ref_id) on xp_ledger
 *     prevents double-credit on retry and on backfill replay. The
 *     service layer relies on this; it does NOT introduce a second
 *     idempotency check.
 *
 * Lessons baked in:
 *   - No README in this directory (lesson 2.10 hotfix 3).
 *   - No inner-quote string defaults (lesson 0047).
 *   - No now()/STABLE in index predicates (lesson 0049 — moot here,
 *     no partial indexes).
 *   - ON DELETE CASCADE for PDPL account-deletion contract
 *     (Wave 2.7).
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("grammar_progress", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: {
      type: "uuid",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    type: { type: "text", notNull: true, check: "type IN ('lesson', 'exam')" },
    item_id: { type: "text", notNull: true },
    score: { type: "integer", notNull: true, check: "score >= 0 AND score <= 100" },
    passed: { type: "boolean" },
    xp_earned: { type: "integer", notNull: true, default: 0 },
    completed_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.addConstraint("grammar_progress", "unique_grammar_progress_user_type_item", {
    unique: ["user_id", "type", "item_id"],
  });

  pgm.createIndex("grammar_progress", "user_id", {
    name: "idx_grammar_progress_user",
  });

  pgm.createIndex("grammar_progress", ["user_id", "type"], {
    name: "idx_grammar_progress_user_type",
  });
};

exports.down = (pgm) => {
  pgm.dropTable("grammar_progress");
};
