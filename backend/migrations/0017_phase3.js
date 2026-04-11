/* eslint-disable camelcase */

/**
 * Migration 0017 — Phase 3 Social: Study Rooms + Share Cards
 *
 * Adds study rooms (members, goals, contributions, notes, activity feed,
 * daily status) and share card generation tracking.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // Study Rooms
  pgm.createTable("study_rooms", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    name: { type: "text", notNull: true },
    created_by_user_id: { type: "uuid", notNull: true, references: '"users"', onDelete: "CASCADE" },
    status: { type: "text", notNull: true, default: "'active'", check: "status IN ('active', 'archived')" },
    max_members: { type: "int", notNull: true, default: 10 },
    room_streak: { type: "int", notNull: true, default: 0 },
    created_at: { type: "timestamptz", default: pgm.func("now()") },
    updated_at: { type: "timestamptz", default: pgm.func("now()") },
  });

  pgm.createTable("study_room_members", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    room_id: { type: "uuid", notNull: true, references: '"study_rooms"', onDelete: "CASCADE" },
    user_id: { type: "uuid", notNull: true, references: '"users"', onDelete: "CASCADE" },
    role: { type: "text", notNull: true, default: "'member'", check: "role IN ('owner', 'member')" },
    status: { type: "text", notNull: true, default: "'active'", check: "status IN ('invited', 'active', 'left')" },
    joined_at: { type: "timestamptz", default: pgm.func("now()") },
    last_seen_at: { type: "timestamptz" },
  });
  pgm.addConstraint("study_room_members", "unique_room_member", { unique: ["room_id", "user_id"] });

  pgm.createTable("study_room_goals", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    room_id: { type: "uuid", notNull: true, references: '"study_rooms"', onDelete: "CASCADE" },
    goal_type: { type: "text", notNull: true, check: "goal_type IN ('speaking_sessions', 'writing_tasks', 'xp', 'consistency_days', 'lessons')" },
    target_value: { type: "int", notNull: true },
    start_date: { type: "date", notNull: true },
    end_date: { type: "date", notNull: true },
    status: { type: "text", notNull: true, default: "'active'", check: "status IN ('active', 'completed', 'failed')" },
    created_by_user_id: { type: "uuid", notNull: true, references: '"users"' },
    created_at: { type: "timestamptz", default: pgm.func("now()") },
  });

  pgm.createTable("study_room_goal_contributions", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    goal_id: { type: "uuid", notNull: true, references: '"study_room_goals"', onDelete: "CASCADE" },
    user_id: { type: "uuid", notNull: true, references: '"users"', onDelete: "CASCADE" },
    contribution_value: { type: "int", notNull: true, default: 0 },
    updated_at: { type: "timestamptz", default: pgm.func("now()") },
  });
  pgm.addConstraint("study_room_goal_contributions", "unique_goal_contribution", { unique: ["goal_id", "user_id"] });

  pgm.createTable("study_room_notes", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    room_id: { type: "uuid", notNull: true, references: '"study_rooms"', onDelete: "CASCADE" },
    user_id: { type: "uuid", notNull: true, references: '"users"', onDelete: "CASCADE" },
    note_type: { type: "text", notNull: true, check: "note_type IN ('tip', 'reminder', 'motivation', 'question')" },
    content: { type: "text", notNull: true },
    is_pinned: { type: "boolean", notNull: true, default: false },
    created_at: { type: "timestamptz", default: pgm.func("now()") },
    deleted_at: { type: "timestamptz" },
  });

  pgm.createTable("study_room_activity_feed", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    room_id: { type: "uuid", notNull: true, references: '"study_rooms"', onDelete: "CASCADE" },
    user_id: { type: "uuid", notNull: true, references: '"users"', onDelete: "CASCADE" },
    activity_type: { type: "text", notNull: true },
    metadata: { type: "jsonb", notNull: true, default: pgm.func("'{}'::jsonb") },
    created_at: { type: "timestamptz", default: pgm.func("now()") },
  });

  pgm.createTable("study_room_daily_status", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    room_id: { type: "uuid", notNull: true, references: '"study_rooms"', onDelete: "CASCADE" },
    user_id: { type: "uuid", notNull: true, references: '"users"', onDelete: "CASCADE" },
    date: { type: "date", notNull: true, default: pgm.func("CURRENT_DATE") },
    has_practiced: { type: "boolean", notNull: true, default: false },
    xp_today: { type: "int", notNull: true, default: 0 },
    speaking_sessions_today: { type: "int", notNull: true, default: 0 },
    writing_sessions_today: { type: "int", notNull: true, default: 0 },
    updated_at: { type: "timestamptz", default: pgm.func("now()") },
  });
  pgm.addConstraint("study_room_daily_status", "unique_room_daily_status", { unique: ["room_id", "user_id", "date"] });

  // Share cards
  pgm.createTable("share_card_generations", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: { type: "uuid", notNull: true, references: '"users"', onDelete: "CASCADE" },
    template_key: { type: "text", notNull: true },
    stats_snapshot: { type: "jsonb", notNull: true },
    trigger_type: { type: "text" },
    image_url: { type: "text" },
    created_at: { type: "timestamptz", default: pgm.func("now()") },
  });

  // Indexes
  pgm.createIndex("study_room_members", "user_id", { name: "idx_room_members_user" });
  pgm.createIndex("study_room_activity_feed", ["room_id", "created_at"], { name: "idx_room_feed_room_time" });
  pgm.createIndex("study_room_daily_status", ["room_id", "date"], { name: "idx_room_daily_room_date" });
};

exports.down = (pgm) => {
  pgm.dropTable("share_card_generations");
  pgm.dropTable("study_room_daily_status");
  pgm.dropTable("study_room_activity_feed");
  pgm.dropTable("study_room_notes");
  pgm.dropTable("study_room_goal_contributions");
  pgm.dropTable("study_room_goals");
  pgm.dropTable("study_room_members");
  pgm.dropTable("study_rooms");
};
