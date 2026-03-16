/* eslint-disable camelcase */

/**
 * Migration 0006 — Scenario Speaking Practice
 *
 * Adds three tables for the conversation-based scenario speaking feature:
 *   - scenarios            – scenario definitions (catalogue)
 *   - scenario_sessions    – per-user conversation sessions
 *   - conversation_turns   – individual messages within a session
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // -----------------------------------------------------------------------
  // scenarios — the scenario catalogue
  // -----------------------------------------------------------------------
  pgm.createTable("scenarios", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    title: {
      type: "varchar(255)",
      notNull: true,
    },
    description: {
      type: "text",
    },
    category: {
      type: "varchar(50)",
      notNull: true,
    },
    difficulty: {
      type: "varchar(20)",
      notNull: true,
      default: "beginner",
      check: "difficulty IN ('beginner', 'intermediate', 'advanced')",
    },
    system_prompt: {
      type: "text",
      notNull: true,
    },
    opening_message: {
      type: "text",
      notNull: true,
    },
    emoji: {
      type: "varchar(10)",
    },
    tags: {
      type: "jsonb",
      default: pgm.func("'[]'::jsonb"),
    },
    estimated_turns: {
      type: "integer",
      default: 8,
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  pgm.createIndex("scenarios", ["category"], {
    name: "idx_scenarios_category",
  });

  // -----------------------------------------------------------------------
  // scenario_sessions — per-user conversation sessions
  // -----------------------------------------------------------------------
  pgm.createTable("scenario_sessions", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    scenario_id: {
      type: "uuid",
      notNull: true,
      references: "scenarios(id)",
      onDelete: "CASCADE",
    },
    user_id: {
      type: "uuid",
      notNull: true,
      references: "users(id)",
      onDelete: "CASCADE",
    },
    status: {
      type: "varchar(20)",
      notNull: true,
      default: "active",
      check: "status IN ('active', 'completed', 'abandoned')",
    },
    overall_score: {
      type: "real",
    },
    fluency_score: {
      type: "real",
    },
    vocabulary_score: {
      type: "real",
    },
    grammar_score: {
      type: "real",
    },
    coach_feedback: {
      type: "text",
    },
    turn_count: {
      type: "integer",
    },
    word_count: {
      type: "integer",
    },
    duration_ms: {
      type: "integer",
    },
    started_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
    completed_at: {
      type: "timestamptz",
    },
  });

  pgm.createIndex("scenario_sessions", ["user_id", "status"], {
    name: "idx_scenario_sessions_user_status",
  });

  pgm.createIndex("scenario_sessions", ["scenario_id"], {
    name: "idx_scenario_sessions_scenario",
  });

  // -----------------------------------------------------------------------
  // conversation_turns — individual messages within a session
  // -----------------------------------------------------------------------
  pgm.createTable("conversation_turns", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    session_id: {
      type: "uuid",
      notNull: true,
      references: "scenario_sessions(id)",
      onDelete: "CASCADE",
    },
    turn_index: {
      type: "integer",
      notNull: true,
    },
    role: {
      type: "varchar(20)",
      notNull: true,
      check: "role IN ('user', 'assistant')",
    },
    content: {
      type: "text",
      notNull: true,
    },
    audio_storage_key: {
      type: "text",
    },
    scores: {
      type: "jsonb",
    },
    feedback: {
      type: "text",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  pgm.createIndex("conversation_turns", ["session_id", "turn_index"], {
    name: "idx_conversation_turns_session_order",
  });
};

exports.down = (pgm) => {
  pgm.dropTable("conversation_turns");
  pgm.dropTable("scenario_sessions");
  pgm.dropTable("scenarios");
};
