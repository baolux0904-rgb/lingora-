/**
 * domain/userLifecycle.js
 *
 * Account-deletion transaction (Wave 2.7, PDPL VN — Nghị định 13/2023).
 *
 * Soft-deletes a user: anonymizes the row + bumps password_version (revoking
 * every outstanding access token via the Wave 1.3 verifyToken mechanism) +
 * hard-deletes communication content (messages, friendships, friend
 * requests, notifications, refresh tokens) + forfeits any in-flight
 * battles. Aggregate stats (xp_ledger, badges, battle_matches as a record,
 * scenario_sessions, writing_submissions) keep the user_id FK pointing at
 * the now-anonymized row so leaderboard history stays mathematically
 * consistent. PDPL Article 16 is satisfied because the row no longer
 * carries identifiable PII.
 *
 * The whole sequence runs inside ONE pg transaction. R2 cleanup and the
 * confirmation email are returned as fire-and-forget side-effects to the
 * caller — they happen AFTER commit so a storage hiccup never rolls back
 * the legally-required deletion.
 *
 * Idempotent: a second call with the same userId early-returns without
 * touching anything.
 *
 * Ref check (audit Wave 2.7):
 *   - users.email/username are partial-unique on `WHERE deleted_at IS NULL`
 *     (migration 0046) — anonymized rows never collide with active users.
 *   - users.parent_id ON DELETE SET NULL (migration 0001) — children of
 *     a deleted parent stay; their parent_id becomes NULL.
 *   - All FKs to users.id are CASCADE except battle_matches.winner_user_id
 *     (SET NULL, migration 0046) — winner display reads "deleted" instead
 *     of breaking the join.
 */

"use strict";

const crypto = require("crypto");
const { pool } = require("../config/db");
const battleService = require("../services/battleService");

const PLACEHOLDER_NAME = "Người dùng đã xóa";
const ANON_USERNAME_PREFIX = "deleted_";

/**
 * Run an account deletion. Pure orchestration — does NOT validate
 * authorization (the caller must have already confirmed the userId is
 * the authenticated user) and does NOT validate the confirmation token
 * (the controller does that before calling this).
 *
 * @param {string} userId
 * @returns {Promise<{
 *   alreadyDeleted: boolean,
 *   userSnapshot: { email: string|null, name: string|null }|null,
 *   stats: {
 *     forfeitedMatches: number,
 *     queueCancelled: number,
 *     messagesDeleted: number,
 *     friendshipsDeleted: number,
 *     refreshTokensRevoked: number,
 *   },
 *   voiceNoteKeys: string[],
 *   avatarUrl: string|null,
 * }>}
 */
async function softDeleteUser(userId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Lock the user row + check current state.
    const { rows: userRows } = await client.query(
      `SELECT email, name, avatar_url, deleted_at
         FROM users
        WHERE id = $1
        FOR UPDATE`,
      [userId],
    );
    if (userRows.length === 0) {
      await client.query("ROLLBACK");
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    if (userRows[0].deleted_at !== null) {
      // Idempotent — second call after a successful delete is a no-op.
      await client.query("ROLLBACK");
      return {
        alreadyDeleted: true,
        userSnapshot:   null,
        stats:          {
          forfeitedMatches:    0,
          queueCancelled:      0,
          messagesDeleted:     0,
          friendshipsDeleted:  0,
          refreshTokensRevoked: 0,
        },
        voiceNoteKeys: [],
        avatarUrl:     null,
      };
    }
    const userSnapshot = { email: userRows[0].email, name: userRows[0].name };
    const avatarUrl    = userRows[0].avatar_url ?? null;

    // 2. Collect R2 object keys for voice notes BEFORE deleting message rows.
    //    We only need the audio_url; key extraction is the storage layer's
    //    concern in the post-commit cleanup.
    const { rows: voiceRows } = await client.query(
      `SELECT audio_url
         FROM messages
        WHERE (sender_id = $1 OR receiver_id = $1)
          AND type = 'voice'
          AND audio_url IS NOT NULL`,
      [userId],
    );
    const voiceNoteKeys = voiceRows
      .map((r) => extractObjectKeyFromUrl(r.audio_url))
      .filter(Boolean);

    // 3. Forfeit in-flight battles. Same client → same transaction.
    const battleStats = await battleService.forfeitActiveMatchesForUser(userId, client);

    // 4. Hard-delete personal-content rows. CASCADE FKs would do this on a
    //    HARD user delete, but we are SOFT-deleting (UPDATE) — so explicit
    //    deletes are required.
    const { rowCount: messagesDeleted } = await client.query(
      `DELETE FROM messages WHERE sender_id = $1 OR receiver_id = $1`,
      [userId],
    );

    // Friendships use user_low_id/user_high_id (ordered pair). Capture the
    // remaining-friend list FIRST so we can decrement their friend_count
    // after the delete — otherwise their UI shows a stale count.
    const { rows: friendRows } = await client.query(
      `SELECT CASE WHEN user_low_id = $1 THEN user_high_id ELSE user_low_id END AS friend_id
         FROM friendships
        WHERE user_low_id = $1 OR user_high_id = $1`,
      [userId],
    );
    const friendIds = friendRows.map((r) => r.friend_id);

    const { rowCount: friendshipsDeleted } = await client.query(
      `DELETE FROM friendships WHERE user_low_id = $1 OR user_high_id = $1`,
      [userId],
    );

    if (friendIds.length > 0) {
      await client.query(
        `UPDATE users
            SET friend_count = GREATEST(friend_count - 1, 0),
                updated_at = now()
          WHERE id = ANY($1::uuid[])`,
        [friendIds],
      );
    }

    await client.query(
      `DELETE FROM friend_requests WHERE sender_user_id = $1 OR receiver_user_id = $1`,
      [userId],
    );

    await client.query(`DELETE FROM notifications WHERE user_id = $1`, [userId]);

    // Accountability pings = personal communication content. Clean up.
    // The accountability_pings FK to users is CASCADE on hard delete; we
    // remove them explicitly here for the soft-delete path.
    await client.query(
      `DELETE FROM accountability_pings
        WHERE sender_user_id = $1 OR receiver_user_id = $1`,
      [userId],
    );

    const { rowCount: refreshTokensRevoked } = await client.query(
      `DELETE FROM refresh_tokens WHERE user_id = $1`,
      [userId],
    );

    // 5. Anonymize the user row + revoke all access JWTs by bumping
    //    password_version (Wave 1.3 mechanism).
    const anonUsername = ANON_USERNAME_PREFIX + crypto
      .createHash("md5")
      .update(userId)
      .digest("hex")
      .slice(0, 8);

    await client.query(
      `UPDATE users
          SET deleted_at        = now(),
              email             = NULL,
              name              = $2,
              username          = $3,
              avatar_url        = NULL,
              bio               = NULL,
              location          = NULL,
              dob               = NULL,
              consent_at        = NULL,
              parent_id         = NULL,
              password_hash     = NULL,
              password_version  = COALESCE(password_version, 0) + 1,
              auto_renew        = false,
              preferences       = '{}'::jsonb,
              qr_token          = NULL,
              updated_at        = now()
        WHERE id = $1`,
      [userId, PLACEHOLDER_NAME, anonUsername],
    );

    await client.query("COMMIT");

    return {
      alreadyDeleted: false,
      userSnapshot,
      stats: {
        forfeitedMatches:    battleStats.forfeited,
        queueCancelled:      battleStats.queueCancelled,
        messagesDeleted,
        friendshipsDeleted,
        refreshTokensRevoked,
      },
      voiceNoteKeys,
      avatarUrl,
    };
  } catch (err) {
    try { await client.query("ROLLBACK"); } catch { /* ignore */ }
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Strip the bucket/CDN host from a stored URL and return the object key
 * that the R2 SDK consumes. Returns null on anything that doesn't look
 * like an HTTP URL we own — defensive against legacy rows.
 */
function extractObjectKeyFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const u = new URL(url);
    // R2 public URLs and pre-signed URLs both expose the key as the path.
    return u.pathname.replace(/^\/+/, "") || null;
  } catch {
    return null;
  }
}

module.exports = {
  softDeleteUser,
  PLACEHOLDER_NAME,
  ANON_USERNAME_PREFIX,
  // Exported for test only:
  __internal: { extractObjectKeyFromUrl },
};
