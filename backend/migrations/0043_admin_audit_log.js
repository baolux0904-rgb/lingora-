/* eslint-disable camelcase */

/**
 * Migration 0043 — admin_audit_log table
 *
 * Captures every admin write action (mass-mail blast, future user
 * mutations) for incident response and compliance. Insert is fire-and-
 * forget after the response is sent, so a logging hiccup never blocks
 * the admin's request.
 *
 * Schema:
 *   id            uuid pk
 *   admin_user_id uuid FK → users (CASCADE on user delete)
 *   action        text — semantic verb, e.g. "send-promo", "send-announcement"
 *   target_type   text nullable — e.g. "users", "campaign"
 *   target_id     uuid nullable — affected entity, when single-target
 *   payload       jsonb — req.body with secrets/passwords/tokens redacted
 *   ip            text nullable — request source IP
 *   user_agent    text nullable
 *   created_at    timestamptz default now()
 *
 * Indexes:
 *   (admin_user_id, created_at DESC) — "what did admin X do recently"
 *   (action, created_at DESC)        — "who fired the send-promo blasts"
 *
 * Closes 1 P0 (Audit Batch 4): admin actions previously had zero trail.
 *
 * NOTE: lifecycle policy (archive >180d, partition by month) deferred
 * to Wave 4 ops once volume is observable.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("admin_audit_log", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    admin_user_id: {
      type: "uuid",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    action: {
      type: "text",
      notNull: true,
    },
    target_type: { type: "text" },
    target_id:   { type: "uuid" },
    payload: {
      type: "jsonb",
      notNull: true,
      default: pgm.func("'{}'::jsonb"),
    },
    ip:         { type: "text" },
    user_agent: { type: "text" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  pgm.createIndex("admin_audit_log", [{ name: "admin_user_id" }, { name: "created_at", sort: "DESC" }], {
    name: "idx_admin_audit_admin_user",
  });
  pgm.createIndex("admin_audit_log", [{ name: "action" }, { name: "created_at", sort: "DESC" }], {
    name: "idx_admin_audit_action",
  });
};

exports.down = (pgm) => {
  pgm.dropIndex("admin_audit_log", undefined, { name: "idx_admin_audit_action", ifExists: true });
  pgm.dropIndex("admin_audit_log", undefined, { name: "idx_admin_audit_admin_user", ifExists: true });
  pgm.dropTable("admin_audit_log");
};
