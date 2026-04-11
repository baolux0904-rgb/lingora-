/* eslint-disable camelcase */

/**
 * Migration 0019 — IELTS Battle System
 *
 * Adds tables for 1v1 async reading battles: seasons, player profiles,
 * matches, participants, submissions, and rank transactions.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // -----------------------------------------------------------------------
  // battle_seasons
  // -----------------------------------------------------------------------
  pgm.createTable("battle_seasons", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    name: { type: "text", notNull: true },
    status: { type: "text", notNull: true, default: "'upcoming'", check: "status IN ('upcoming', 'active', 'ended')" },
    start_at: { type: "timestamptz", notNull: true },
    end_at: { type: "timestamptz", notNull: true },
    soft_reset_factor: { type: "numeric", notNull: true, default: 0.85 },
    created_at: { type: "timestamptz", default: pgm.func("now()") },
  });

  // -----------------------------------------------------------------------
  // battle_player_profiles — lifetime stats
  // -----------------------------------------------------------------------
  pgm.createTable("battle_player_profiles", {
    user_id: { type: "uuid", primaryKey: true, references: '"users"', onDelete: "CASCADE" },
    current_rank_points: { type: "int", notNull: true, default: 0 },
    current_rank_tier: { type: "text", notNull: true, default: "'iron'" },
    wins: { type: "int", notNull: true, default: 0 },
    losses: { type: "int", notNull: true, default: 0 },
    no_submit_losses: { type: "int", notNull: true, default: 0 },
    placement_matches_completed: { type: "int", notNull: true, default: 0 },
    created_at: { type: "timestamptz", default: pgm.func("now()") },
    updated_at: { type: "timestamptz", default: pgm.func("now()") },
  });

  // -----------------------------------------------------------------------
  // battle_season_profiles — per-season stats
  // -----------------------------------------------------------------------
  pgm.createTable("battle_season_profiles", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    season_id: { type: "uuid", notNull: true, references: '"battle_seasons"', onDelete: "CASCADE" },
    user_id: { type: "uuid", notNull: true, references: '"users"', onDelete: "CASCADE" },
    rank_points: { type: "int", notNull: true, default: 0 },
    rank_tier: { type: "text", notNull: true, default: "'iron'" },
    wins: { type: "int", notNull: true, default: 0 },
    losses: { type: "int", notNull: true, default: 0 },
    created_at: { type: "timestamptz", default: pgm.func("now()") },
  });
  pgm.addConstraint("battle_season_profiles", "unique_season_user", { unique: ["season_id", "user_id"] });

  // -----------------------------------------------------------------------
  // battle_matches
  // -----------------------------------------------------------------------
  pgm.createTable("battle_matches", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    season_id: { type: "uuid", references: '"battle_seasons"' },
    mode: { type: "text", notNull: true, check: "mode IN ('ranked', 'unranked')" },
    skill_type: { type: "text", notNull: true, default: "'reading'" },
    status: { type: "text", notNull: true, default: "'queued'",
      check: "status IN ('queued', 'matched', 'active', 'awaiting_opponent', 'completed', 'expired', 'cancelled')" },
    battle_format: { type: "text", notNull: true, default: "'async'" },
    question_set_id: { type: "uuid", references: '"reading_passages"' },
    winner_user_id: { type: "uuid", references: '"users"' },
    submission_deadline_at: { type: "timestamptz" },
    started_at: { type: "timestamptz" },
    completed_at: { type: "timestamptz" },
    created_at: { type: "timestamptz", default: pgm.func("now()") },
  });

  // -----------------------------------------------------------------------
  // battle_match_participants
  // -----------------------------------------------------------------------
  pgm.createTable("battle_match_participants", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    match_id: { type: "uuid", notNull: true, references: '"battle_matches"', onDelete: "CASCADE" },
    user_id: { type: "uuid", notNull: true, references: '"users"', onDelete: "CASCADE" },
    status: { type: "text", notNull: true, default: "'active'",
      check: "status IN ('active', 'submitted', 'no_submit')" },
    submitted_at: { type: "timestamptz" },
    individual_score: { type: "numeric", notNull: true, default: 0 },
    rank_points_before: { type: "int" },
    rank_points_after: { type: "int" },
    rank_delta: { type: "int" },
    xp_reward: { type: "int", notNull: true, default: 0 },
  });
  pgm.addConstraint("battle_match_participants", "unique_match_user", { unique: ["match_id", "user_id"] });

  // -----------------------------------------------------------------------
  // battle_submissions
  // -----------------------------------------------------------------------
  pgm.createTable("battle_submissions", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    match_id: { type: "uuid", notNull: true, references: '"battle_matches"', onDelete: "CASCADE" },
    participant_id: { type: "uuid", notNull: true, references: '"battle_match_participants"', onDelete: "CASCADE" },
    answers_json: { type: "jsonb", notNull: true },
    final_score: { type: "numeric", notNull: true, default: 0 },
    time_seconds: { type: "int" },
    submitted_at: { type: "timestamptz", default: pgm.func("now()") },
  });

  // -----------------------------------------------------------------------
  // battle_rank_transactions — audit trail for rank changes
  // -----------------------------------------------------------------------
  pgm.createTable("battle_rank_transactions", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: { type: "uuid", notNull: true, references: '"users"', onDelete: "CASCADE" },
    match_id: { type: "uuid", references: '"battle_matches"' },
    delta: { type: "int", notNull: true },
    reason: { type: "text", notNull: true, check: "reason IN ('win', 'loss', 'no_submit', 'placement')" },
    created_at: { type: "timestamptz", default: pgm.func("now()") },
  });

  // -----------------------------------------------------------------------
  // Indexes
  // -----------------------------------------------------------------------
  pgm.createIndex("battle_matches", ["status"], { name: "idx_battle_matches_status" });
  pgm.createIndex("battle_matches", ["season_id"], { name: "idx_battle_matches_season" });
  pgm.createIndex("battle_match_participants", ["user_id"], { name: "idx_battle_participants_user" });
  pgm.createIndex("battle_match_participants", ["match_id"], { name: "idx_battle_participants_match" });
  pgm.createIndex("battle_rank_transactions", ["user_id", "created_at"], { name: "idx_battle_rank_tx_user_time" });
  pgm.createIndex("battle_player_profiles", ["current_rank_points"], { name: "idx_battle_profiles_rank" });

  // -----------------------------------------------------------------------
  // Seed first active season (49 days)
  // -----------------------------------------------------------------------
  pgm.sql(`
    INSERT INTO battle_seasons (name, status, start_at, end_at, soft_reset_factor)
    VALUES ('Season 1', 'active', NOW(), NOW() + INTERVAL '49 days', 0.85);
  `);
};

exports.down = (pgm) => {
  pgm.dropTable("battle_rank_transactions");
  pgm.dropTable("battle_submissions");
  pgm.dropTable("battle_match_participants");
  pgm.dropTable("battle_matches");
  pgm.dropTable("battle_season_profiles");
  pgm.dropTable("battle_player_profiles");
  pgm.dropTable("battle_seasons");
};
