/* eslint-disable camelcase */

/**
 * Migration 0037 — Add client_message_id for optimistic UI dedup
 *
 * Frontend generates a UUID per outgoing message and sends it as client_message_id.
 * Delta polling returns the same column so the client can match optimistic bubbles
 * with the server-persisted row. Partial unique index makes the send idempotent:
 * retrying the same client_message_id returns the existing row (see chatRepository).
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns("messages", {
    client_message_id: { type: "uuid", notNull: false },
  });

  pgm.createIndex("messages", "client_message_id", {
    name: "idx_messages_client_message_id",
    unique: true,
    where: "client_message_id IS NOT NULL",
  });
};

exports.down = (pgm) => {
  pgm.dropIndex("messages", "client_message_id", {
    name: "idx_messages_client_message_id",
  });
  pgm.dropColumns("messages", ["client_message_id"]);
};
