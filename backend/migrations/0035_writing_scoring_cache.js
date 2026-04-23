/* eslint-disable camelcase */

/**
 * Migration 0035 — IELTS Writing scoring cache.
 *
 * Stores the median result of 3x GPT-4o-mini scoring samples keyed by
 * a deterministic hash of (normalized_essay + prompt_signature). A cache
 * hit returns <50ms; a miss pays for 3 parallel API calls.
 *
 * TTL / eviction: NOT implemented this round. The table grows unbounded
 * until we add a nightly cron that trims entries where last_hit_at is
 * older than N days. idx_writing_scoring_cache_last_hit is pre-built to
 * make that cron cheap.
 *
 * Defaults are declared via pgm.func() to avoid the string-literal
 * wrapping bug that migration 0034 just fixed.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("writing_scoring_cache", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    cache_key: {
      // SHA256 hex = 64 chars
      type: "varchar(64)",
      notNull: true,
    },
    essay_hash: {
      type: "varchar(64)",
      notNull: true,
    },
    writing_question_id: {
      type: "uuid",
      references: '"writing_questions"',
      onDelete: "SET NULL",
    },
    task_type: {
      type: "varchar(10)",
      notNull: true,
      check: "task_type IN ('task1', 'task2')",
    },
    scoring_result: {
      type: "jsonb",
      notNull: true,
    },
    sample_count: {
      type: "integer",
      notNull: true,
      default: pgm.func("3"),
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
    last_hit_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
    hit_count: {
      type: "integer",
      notNull: true,
      default: pgm.func("1"),
    },
  });

  // Primary lookup — UNIQUE so INSERT ... ON CONFLICT can upsert hit metadata.
  pgm.addConstraint("writing_scoring_cache", "uq_writing_scoring_cache_key", {
    unique: ["cache_key"],
  });

  // Secondary lookup — may want to find "any prior scoring of this essay
  // regardless of prompt binding" for analytics.
  pgm.createIndex("writing_scoring_cache", ["essay_hash"], {
    name: "idx_writing_scoring_cache_essay_hash",
  });

  // LRU-friendly for the future eviction cron.
  pgm.createIndex("writing_scoring_cache", ["last_hit_at"], {
    name: "idx_writing_scoring_cache_last_hit",
  });
};

exports.down = (pgm) => {
  pgm.dropTable("writing_scoring_cache");
};
