/* eslint-disable camelcase */

/**
 * Migration 0056 — Waitlist (Wave 6 Sprint 2D).
 *
 * Pre-launch landing-page lead capture. Stores interest signals from
 * visitors who submit the waitlist form on lingona.app/.
 *
 * Schema notes:
 *   - email is UNIQUE — single signup per address, dedup via 23505 in repo.
 *   - interested_tier is the tier the user clicked into the modal from
 *     (free | pro | pro_annual). Free still tracked because we want to know
 *     who shows interest at all, not just paid intent.
 *   - goal_band is optional; the modal defaults it to 'unsure' but we store
 *     NULL when the user explicitly skips. Enum-checked via CHECK to keep
 *     bad payloads out.
 *   - is_student auto-set TRUE when the email matches the .edu pattern
 *     at signup time; surfaces 20% Pro discount on launch.
 *   - source defaults to 'landing' (only entry point Sprint 2D); future
 *     campaigns can add 'fb_ad', 'partner', etc.
 *   - ip_address + user_agent for analytics + abuse tracing.
 *   - email_confirmed_at is reserved for a future double-opt-in flow
 *     (Sprint 2D ships single-opt with confirmation email but no click-to-
 *     confirm requirement).
 *
 * NO foreign key to users — waitlist signups happen pre-auth, no user
 * record exists yet. When the user later registers we'll match on email
 * client-side at upgrade time.
 *
 * Lessons baked in (per existing migration discipline):
 *   - No README in this directory.
 *   - CHECK constraints for enum columns instead of pg ENUM types
 *     (cheaper to evolve).
 *   - text columns (not VARCHAR) per Postgres best practice.
 *   - timestamptz everywhere (per project §10).
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("waitlist", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    email: { type: "text", notNull: true },
    name: { type: "text", notNull: true },
    interested_tier: {
      type: "text",
      notNull: true,
      check: "interested_tier IN ('free', 'pro', 'pro_annual')",
    },
    goal_band: {
      type: "text",
      check: "goal_band IS NULL OR goal_band IN ('5.5', '6.0', '6.5', '7.0', '7.5+', 'unsure')",
    },
    is_student: { type: "boolean", notNull: true, default: false },
    source: { type: "text", notNull: true, default: "landing" },
    ip_address: { type: "text" },
    user_agent: { type: "text" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    email_confirmed_at: { type: "timestamptz" },
  });

  pgm.addConstraint("waitlist", "unique_waitlist_email", {
    unique: ["email"],
  });

  pgm.createIndex("waitlist", "created_at", {
    name: "idx_waitlist_created_at",
  });

  pgm.createIndex("waitlist", "interested_tier", {
    name: "idx_waitlist_interested_tier",
  });
};

exports.down = (pgm) => {
  pgm.dropTable("waitlist");
};
