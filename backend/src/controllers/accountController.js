/**
 * controllers/accountController.js
 *
 * Account self-management HTTP layer.
 *
 *   DELETE /api/v1/users/me — Soft-delete the authenticated user.
 *     Body: { confirm_text: "XÓA" }
 *
 * Soul §1: honest UX. We say what is deleted vs anonymized in the
 * follow-up email; we never pretend it was undoable.
 *
 * Security checkpoints (secure-code-guardian):
 *   - verifyToken (route-level) → req.user.id is trusted
 *   - confirm_text exact match (case-sensitive) → server-side guard
 *   - rate limited (1/hr typical, 2/hr burst) at route level
 *   - parameterized queries throughout the lifecycle module
 *   - userSnapshot captured BEFORE anonymization for the email
 *   - R2 cleanup + email run AFTER commit (fire-and-forget) so a 3rd-party
 *     hiccup never rolls back the legally-required deletion
 */

"use strict";

const { sendSuccess, sendError } = require("../response");
const { softDeleteUser } = require("../domain/userLifecycle");
const { sendAccountDeletedEmail } = require("../services/emailService");
const storage = require("../providers/storage/storageProvider");

const REQUIRED_CONFIRMATION = "XÓA";

async function deleteAccount(req, res, next) {
  try {
    const userId = req.user.id;
    const confirmText = req.body?.confirm_text;

    // Server-side enforcement — never trust the FE-only check.
    if (typeof confirmText !== "string" || confirmText !== REQUIRED_CONFIRMATION) {
      return sendError(res, {
        status: 400,
        message: `Vui lòng gõ "${REQUIRED_CONFIRMATION}" (in hoa) để xác nhận.`,
        code: "ACCOUNT_DELETE_CONFIRM_REQUIRED",
      });
    }

    let result;
    try {
      result = await softDeleteUser(userId);
    } catch (err) {
      if (err.status === 404) return sendError(res, { status: 404, message: "Không tìm thấy tài khoản." });
      throw err;
    }

    // Idempotent re-call after a successful delete: tokens are already
    // invalidated by the bumped password_version, so this branch should
    // be unreachable in practice, but we cover it for safety.
    if (result.alreadyDeleted) {
      return sendSuccess(res, { message: "Tài khoản đã được xóa trước đó." });
    }

    // Audit log — security event per skill mandate.
    console.warn(
      `[account-delete] user=${userId} forfeited=${result.stats.forfeitedMatches} ` +
      `queue=${result.stats.queueCancelled} messages=${result.stats.messagesDeleted} ` +
      `friendships=${result.stats.friendshipsDeleted} refresh_tokens=${result.stats.refreshTokensRevoked} ` +
      `voice_notes=${result.voiceNoteKeys.length} avatar=${result.avatarUrl ? "yes" : "no"}`,
    );

    // ── Post-commit fire-and-forget: R2 cleanup + email ────────────────────
    // Both are best-effort. A failure here is logged and surfaced via Sentry
    // (provider-level), but does NOT roll back the deletion or leak a 5xx
    // to a user who has already had their account legally erased.
    cleanupR2Assets(result.voiceNoteKeys, result.avatarUrl).catch((cleanupErr) => {
      console.error(`[account-delete] R2 cleanup failed user=${userId}:`, cleanupErr.message);
    });

    sendAccountDeletedEmail(result.userSnapshot).catch((emailErr) => {
      console.error(`[account-delete] email failed user=${userId}:`, emailErr.message);
    });

    return sendSuccess(res, { message: "Tài khoản đã được xóa." });
  } catch (err) {
    next(err);
  }
}

/**
 * Best-effort R2 object cleanup. Runs Promise.allSettled so one bad URL
 * never poisons the rest of the batch.
 */
async function cleanupR2Assets(voiceNoteKeys, avatarUrl) {
  const keys = [...voiceNoteKeys];

  // Avatar URL is stored as a full URL — extract the key the same way
  // the lifecycle module does for voice notes.
  if (avatarUrl) {
    try {
      const u = new URL(avatarUrl);
      const k = u.pathname.replace(/^\/+/, "");
      if (k) keys.push(k);
    } catch { /* not a URL — nothing to delete */ }
  }

  if (keys.length === 0) return;

  // The provider exposes deleteObject(key) — call once per key. R2's
  // batch DeleteObjects exists in @aws-sdk/client-s3 but our wrapper
  // doesn't expose it; one-by-one is correct for the Lingona scale
  // (a heavy chat user has tens of voice notes, not thousands).
  await Promise.allSettled(keys.map((k) => storage.deleteObject(k)));
}

module.exports = { deleteAccount, REQUIRED_CONFIRMATION };
