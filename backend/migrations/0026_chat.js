/* eslint-disable camelcase */

/**
 * Migration 0026 — Friend Chat
 *
 * Adds messages table for 1:1 friend chat with text + voice support.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("messages", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    sender_id: { type: "uuid", notNull: true, references: '"users"', onDelete: "CASCADE" },
    receiver_id: { type: "uuid", notNull: true, references: '"users"', onDelete: "CASCADE" },
    type: { type: "text", notNull: true, default: "'text'", check: "type IN ('text', 'voice')" },
    content: { type: "text" },
    audio_url: { type: "text" },
    audio_duration_seconds: { type: "int" },
    seen_at: { type: "timestamptz" },
    deleted_at: { type: "timestamptz" },
    created_at: { type: "timestamptz", default: pgm.func("now()") },
  });

  // Conversation index: find messages between two users sorted by time
  pgm.sql(`
    CREATE INDEX idx_messages_conversation
    ON messages (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), created_at DESC);
  `);

  // Unread index: count unseen messages for a user
  pgm.createIndex("messages", ["receiver_id", "seen_at"], {
    name: "idx_messages_receiver_unseen",
    where: "seen_at IS NULL AND deleted_at IS NULL",
  });
};

exports.down = (pgm) => {
  pgm.dropTable("messages");
};
