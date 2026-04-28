/* eslint-disable camelcase */

/**
 * Migration 0046 — Account-deletion readiness (Wave 2.7, PDPL VN compliance).
 *
 * `users.deleted_at` already exists from migration 0001. This migration
 * fixes the surrounding constraints so the soft-delete + cascade flow is
 * correct:
 *
 * 1. study_room_goals.created_by_user_id has NO onDelete (defaults to
 *    NO ACTION). Future hard purge of a user would be blocked. Switch to
 *    CASCADE — when a user is hard-deleted, the goals they created
 *    disappear (study_room_members already CASCADE so the rest of the
 *    room cleans up; no orphan rows).
 *
 * 2. battle_matches.winner_user_id has NO onDelete. Switch to SET NULL
 *    so a future hard purge does not destroy battle history that the
 *    OPPONENT can still legitimately see ("you won this match"). The
 *    winner field becomes NULL = "winner deleted their account".
 *
 * 3. users.email is UNIQUE NOT NULL across the table. After soft-delete
 *    we set email = NULL to free the address for re-signup, but NOT NULL
 *    blocks that. We:
 *      - drop the system-generated UNIQUE constraint
 *      - drop NOT NULL
 *      - recreate UNIQUE as a partial index WHERE deleted_at IS NULL
 *    Effect: active users keep the uniqueness invariant; soft-deleted
 *    rows can have NULL email without colliding.
 *
 * 4. users.username and users.qr_token follow the same pattern (UNIQUE,
 *    nullable). Repeat the partial-unique transform so anonymized
 *    "deleted_<hash>" usernames don't collide with anything and so the
 *    system never blocks signup because a *deleted* user once held the
 *    username.
 *
 * No data migration: all 7 prod users are active, deleted_at IS NULL.
 *
 * Down: re-add the original constraints. The partial→full unique flip
 * is safe to roll back because no prod user is currently soft-deleted,
 * so no row has a NULL email/username that would conflict.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // ── 1. study_room_goals.created_by_user_id → CASCADE ──────────────────────
  pgm.sql(`
    ALTER TABLE study_room_goals
      DROP CONSTRAINT IF EXISTS study_room_goals_created_by_user_id_fkey;
    ALTER TABLE study_room_goals
      ADD CONSTRAINT study_room_goals_created_by_user_id_fkey
        FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE;
  `);

  // ── 2. battle_matches.winner_user_id → SET NULL ───────────────────────────
  pgm.sql(`
    ALTER TABLE battle_matches
      DROP CONSTRAINT IF EXISTS battle_matches_winner_user_id_fkey;
    ALTER TABLE battle_matches
      ADD CONSTRAINT battle_matches_winner_user_id_fkey
        FOREIGN KEY (winner_user_id) REFERENCES users(id) ON DELETE SET NULL;
  `);

  // ── 3. users.email — drop NOT NULL + full UNIQUE, add partial UNIQUE ──────
  pgm.sql(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;`);
  pgm.sql(`ALTER TABLE users ALTER COLUMN email DROP NOT NULL;`);
  pgm.createIndex("users", "email", {
    name: "ux_users_email_active",
    unique: true,
    where: "deleted_at IS NULL AND email IS NOT NULL",
  });

  // ── 4a. users.username — partial UNIQUE ───────────────────────────────────
  pgm.sql(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;`);
  pgm.createIndex("users", "username", {
    name: "ux_users_username_active",
    unique: true,
    where: "deleted_at IS NULL AND username IS NOT NULL",
  });

  // ── 4b. users.qr_token — partial UNIQUE ───────────────────────────────────
  pgm.sql(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_qr_token_key;`);
  pgm.createIndex("users", "qr_token", {
    name: "ux_users_qr_token_active",
    unique: true,
    where: "deleted_at IS NULL AND qr_token IS NOT NULL",
  });

  // ── 5. Index for "list deleted users" admin queries (partial, tiny) ───────
  // Migration 0001 already creates idx_users_deleted_at WHERE deleted_at IS
  // NULL (active-user fast path). Add the inverse so admin / cleanup jobs
  // can find soft-deleted rows efficiently without scanning the full table.
  pgm.createIndex("users", "deleted_at", {
    name: "idx_users_deleted_at_set",
    where: "deleted_at IS NOT NULL",
  });
};

exports.down = (pgm) => {
  // Restore in reverse order. Safe because no prod user is soft-deleted.

  pgm.dropIndex("users", "deleted_at", { name: "idx_users_deleted_at_set" });

  pgm.dropIndex("users", "qr_token", { name: "ux_users_qr_token_active" });
  pgm.sql(`ALTER TABLE users ADD CONSTRAINT users_qr_token_key UNIQUE (qr_token);`);

  pgm.dropIndex("users", "username", { name: "ux_users_username_active" });
  pgm.sql(`ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);`);

  pgm.dropIndex("users", "email", { name: "ux_users_email_active" });
  pgm.sql(`ALTER TABLE users ALTER COLUMN email SET NOT NULL;`);
  pgm.sql(`ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);`);

  pgm.sql(`
    ALTER TABLE battle_matches
      DROP CONSTRAINT IF EXISTS battle_matches_winner_user_id_fkey;
    ALTER TABLE battle_matches
      ADD CONSTRAINT battle_matches_winner_user_id_fkey
        FOREIGN KEY (winner_user_id) REFERENCES users(id);
  `);

  pgm.sql(`
    ALTER TABLE study_room_goals
      DROP CONSTRAINT IF EXISTS study_room_goals_created_by_user_id_fkey;
    ALTER TABLE study_room_goals
      ADD CONSTRAINT study_room_goals_created_by_user_id_fkey
        FOREIGN KEY (created_by_user_id) REFERENCES users(id);
  `);
};
