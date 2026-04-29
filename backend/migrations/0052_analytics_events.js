/* eslint-disable camelcase */

/**
 * Migration 0052 — Self-host analytics events table (Wave 4.13).
 *
 * Backs the existing frontend wrapper (frontend/lib/analytics.ts) that
 * already POSTs to /api/v1/analytics/track. The architectural intent
 * was self-host from day one; this migration finally lands the table.
 *
 * Privacy posture:
 *   - user_id is NULLABLE — anonymous tracking is the default. The
 *     route does not require auth; if a JWT is present, optionalAuth
 *     populates req.user and the controller stamps user_id.
 *   - ON DELETE SET NULL preserves the event timeline when a user
 *     deletes their account (Wave 2.7 PDPL contract). The events
 *     remain anonymous for product analytics; PII never lands here
 *     because the controller PII-guard rejects forbidden keys.
 *   - properties is JSONB so the FE can ship arbitrary shapes per
 *     event without a schema migration per change.
 *
 * Indexes:
 *   - (event_name, created_at DESC) — funnel + time-window queries.
 *   - (user_id, created_at DESC) WHERE user_id IS NOT NULL — partial,
 *     since most rows are anon. Predicate is IS NOT NULL (IMMUTABLE),
 *     not now() (lesson 0049).
 *   - (created_at DESC) — chronological scans / retention sweeps.
 *
 * Lessons baked in:
 *   - No README in this directory (lesson 2.10 hotfix 3).
 *   - No inner-quote string defaults — `'{}'::jsonb` is a literal cast,
 *     not the kind of inner-quote default that broke 0047. pgm.func()
 *     keeps the cast intact.
 *   - No now()/STABLE in index predicates (lesson 0049). The user_id
 *     IS NOT NULL predicate is IMMUTABLE so Postgres accepts it.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("analytics_events", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    event_name: { type: "text", notNull: true },
    properties: {
      type: "jsonb",
      notNull: true,
      default: pgm.func("'{}'::jsonb"),
    },
    user_id: {
      type: "uuid",
      references: '"users"',
      onDelete: "SET NULL",
    },
    session_id: { type: "text", notNull: true },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  pgm.createIndex("analytics_events", [{ name: "event_name" }, { name: "created_at", sort: "DESC" }], {
    name: "idx_analytics_events_event_name",
  });

  pgm.createIndex("analytics_events", [{ name: "user_id" }, { name: "created_at", sort: "DESC" }], {
    name: "idx_analytics_events_user",
    where: "user_id IS NOT NULL",
  });

  pgm.createIndex("analytics_events", [{ name: "created_at", sort: "DESC" }], {
    name: "idx_analytics_events_created_at",
  });
};

exports.down = (pgm) => {
  pgm.dropTable("analytics_events");
};
