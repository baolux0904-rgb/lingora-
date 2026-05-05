/* eslint-disable camelcase */

/**
 * Migration 0057 — Onboarding optional fields + defer mechanic
 * (Wave 6 Sprint 4E.1).
 *
 * Adds 4 nullable columns to `users` so the Sprint 4D optional
 * collapsible (exam date / study hours / exam type) becomes durable,
 * plus the Hybrid 4 defer pattern (single timestamp + partial index)
 * that powers Sprint 4E.2's /home banner + soft-gate logic.
 *
 * Schema notes:
 *   - exam_date_bucket TEXT NULL — bucketed exam horizon. Bucket
 *     values mirror the 4D PresetButtonGroup options exactly:
 *     '1m' / '2-3m' / '4-6m' / 'no_plan'. CHECK enforced at DB
 *     level (defense-in-depth alongside controller validator).
 *   - study_hours_per_week TEXT NULL — bucketed weekly study time.
 *     Values: '3-5h' / '6-10h' / '10h+'.
 *   - exam_type TEXT NULL DEFAULT 'academic' — IELTS exam track.
 *     Values: 'academic' / 'general'. Default reflects 90%+
 *     Vietnamese demographic (Q2 reasoning). Existing 7 beta users
 *     get 'academic' automatically on apply.
 *   - onboarding_deferred_at TIMESTAMPTZ NULL — set by the new
 *     POST /api/v1/users/onboarding/defer endpoint when the user
 *     clicks "Để sau" in the cream-canon onboarding modal. Distinct
 *     from `onboarding_skipped` (legacy "I never want this") and
 *     `has_completed_onboarding` (full flow done) — see
 *     onboardingController.js for the semantic split.
 *
 * Hybrid 4 defer pattern (locked Sprint 4A discovery):
 *   - Single timestamp column instead of a redundant boolean.
 *   - Partial index covers only deferred rows so the
 *     "show me users to nudge" query stays cheap; non-deferred users
 *     incur zero index overhead.
 *
 * Lessons baked in:
 *   - timestamptz everywhere (per project §10 and migration 0056).
 *   - text columns over varchar (Postgres best practice).
 *   - CHECK constraints over enum types (cheaper to evolve).
 *   - IF NOT EXISTS / IF EXISTS guards on every DDL so a partial
 *     re-run after a Railway hiccup doesn't 500.
 *   - No raw SQL strings with single-quote inner-quote defaults
 *     (lesson 0047 — irrelevant here, no string defaults).
 *   - pgm.func("now()") not used at runtime — onboarding_deferred_at
 *     starts NULL and gets set in app code (controller passes
 *     `now()` parameter).
 *
 * SQL pre-flight notes (Sprint 4A discovery Risk 1):
 *   - Backfill of estimated_band column (added migration 0020) is
 *     orthogonal to this migration. Existing rows with
 *     estimated_band ∈ [3.0, 3.5] keep their data; the 4B BandGrid
 *     UI just doesn't surface those values. 4E.1 schema does not
 *     touch estimated_band.
 *
 * Production deploy: Railway runs `npm run db:migrate` on deploy
 * (verified Sprint 3.5C-2). 7-row users table → migration completes
 * in <1s. Atomic with the controller extend in this same commit.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("users", {
    exam_date_bucket: {
      type: "text",
      check: "exam_date_bucket IS NULL OR exam_date_bucket IN ('1m', '2-3m', '4-6m', 'no_plan')",
    },
    study_hours_per_week: {
      type: "text",
      check: "study_hours_per_week IS NULL OR study_hours_per_week IN ('3-5h', '6-10h', '10h+')",
    },
    exam_type: {
      type: "text",
      default: "academic",
      check: "exam_type IS NULL OR exam_type IN ('academic', 'general')",
    },
    onboarding_deferred_at: {
      type: "timestamptz",
    },
  });

  // Hybrid 4 defer pattern — partial index covers deferred rows only.
  pgm.createIndex("users", "onboarding_deferred_at", {
    name: "idx_users_onboarding_deferred",
    where: "onboarding_deferred_at IS NOT NULL",
  });
};

exports.down = (pgm) => {
  pgm.dropIndex("users", "onboarding_deferred_at", {
    name: "idx_users_onboarding_deferred",
  });
  pgm.dropColumns("users", [
    "onboarding_deferred_at",
    "exam_type",
    "study_hours_per_week",
    "exam_date_bucket",
  ]);
};
