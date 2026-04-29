/**
 * services/socialService.js
 *
 * Business logic for social features: friend requests, friendships,
 * notifications, accountability pings, username/QR management.
 */

"use strict";

const repo = require("../repositories/socialRepository");
const { validateUsername } = require("../domain/usernameValidation");
const { canChangeUsername, redirectExpiresAt } = require("../domain/usernameChange");

// Legacy regex kept only for the auto-generator below (3–20 was the
// pre-Wave 2.11 first-time cap). New writes go through validateUsername
// from domain/usernameValidation.js (3–30 + reserved + prefix block).
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

// ---------------------------------------------------------------------------
// Friend requests
// ---------------------------------------------------------------------------

async function sendFriendRequest(senderId, { targetUserId, username, qrToken }) {
  // Resolve target user
  let receiverId = targetUserId;

  if (!receiverId && username) {
    const user = await repo.findUserByUsername(username);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    receiverId = user.id;
  }

  if (!receiverId && qrToken) {
    const user = await repo.findUserByQrToken(qrToken);
    if (!user) {
      const err = new Error("Invalid QR code");
      err.status = 404;
      throw err;
    }
    receiverId = user.id;
  }

  if (!receiverId) {
    const err = new Error("Provide targetUserId, username, or qrToken");
    err.status = 400;
    throw err;
  }

  // Self check
  if (senderId === receiverId) {
    const err = new Error("Cannot send friend request to yourself");
    err.status = 400;
    throw err;
  }

  // Already friends?
  if (await repo.isFriend(senderId, receiverId)) {
    const err = new Error("Already friends");
    err.status = 409;
    throw err;
  }

  // Check existing pending request
  const existing = await repo.getFriendRequestBetween(senderId, receiverId);
  if (existing) {
    // Crossed request: if they already sent to us → auto-accept
    if (existing.sender_user_id === receiverId && existing.status === "pending") {
      return autoAcceptCrossedRequest(senderId, existing);
    }
    if (existing.sender_user_id === senderId && existing.status === "pending") {
      const err = new Error("Friend request already sent");
      err.status = 409;
      throw err;
    }
  }

  const request = await repo.createFriendRequest(senderId, receiverId);

  // Notify receiver
  const sender = await repo.getUserById(senderId);
  await repo.createNotification(receiverId, "friend_request", {
    requestId: request.id,
    senderName: sender?.name || "Someone",
    senderId,
  });

  return request;
}

async function autoAcceptCrossedRequest(userId, existingRequest) {
  await repo.updateFriendRequestStatus(existingRequest.id, "accepted");
  const friendship = await repo.createFriendship(userId, existingRequest.sender_user_id);

  // Notify both
  const user = await repo.getUserById(userId);
  const sender = await repo.getUserById(existingRequest.sender_user_id);
  await repo.createNotification(existingRequest.sender_user_id, "friend_accepted", {
    friendName: user?.name || "Someone",
    friendId: userId,
  });
  await repo.createNotification(userId, "friend_accepted", {
    friendName: sender?.name || "Someone",
    friendId: existingRequest.sender_user_id,
  });

  return { ...existingRequest, status: "accepted", autoAccepted: true, friendship };
}

async function acceptFriendRequest(userId, requestId) {
  const request = await repo.getFriendRequest(requestId);
  if (!request) {
    const err = new Error("Friend request not found");
    err.status = 404;
    throw err;
  }
  if (request.receiver_user_id !== userId) {
    const err = new Error("Not your request to accept");
    err.status = 403;
    throw err;
  }
  if (request.status !== "pending") {
    const err = new Error(`Request already ${request.status}`);
    err.status = 409;
    throw err;
  }

  await repo.updateFriendRequestStatus(requestId, "accepted");
  const friendship = await repo.createFriendship(userId, request.sender_user_id);

  // Notify sender
  const receiver = await repo.getUserById(userId);
  await repo.createNotification(request.sender_user_id, "friend_accepted", {
    friendName: receiver?.name || "Someone",
    friendId: userId,
  });

  return { request: { ...request, status: "accepted" }, friendship };
}

async function rejectFriendRequest(userId, requestId) {
  const request = await repo.getFriendRequest(requestId);
  if (!request) {
    const err = new Error("Friend request not found");
    err.status = 404;
    throw err;
  }
  if (request.receiver_user_id !== userId) {
    const err = new Error("Not your request to reject");
    err.status = 403;
    throw err;
  }
  return repo.updateFriendRequestStatus(requestId, "rejected");
}

async function cancelFriendRequest(userId, requestId) {
  const request = await repo.getFriendRequest(requestId);
  if (!request) {
    const err = new Error("Friend request not found");
    err.status = 404;
    throw err;
  }
  if (request.sender_user_id !== userId) {
    const err = new Error("Not your request to cancel");
    err.status = 403;
    throw err;
  }
  return repo.updateFriendRequestStatus(requestId, "cancelled");
}

// ---------------------------------------------------------------------------
// Friendships
// ---------------------------------------------------------------------------

async function removeFriend(userId, friendUserId) {
  const wasFriend = await repo.deleteFriendship(userId, friendUserId);
  if (!wasFriend) {
    const err = new Error("Not friends");
    err.status = 404;
    throw err;
  }
  return { removed: true };
}

async function getFriends(userId) {
  return repo.getFriends(userId);
}

// ---------------------------------------------------------------------------
// Profile: username + QR
// ---------------------------------------------------------------------------

async function getOrCreateUsername(userId) {
  const user = await repo.getUserById(userId);
  if (user?.username) return user.username;

  // Generate from name + random suffix
  const base = (user?.name || "user").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) || "user";
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  const username = `${base}${suffix}`;
  await repo.setUsername(userId, username);
  return username;
}

/**
 * Username write path (Wave 2.11 — extended).
 *
 * Single endpoint that handles both first-time set and subsequent
 * change. The cooldown only fires when last_username_change_at is
 * non-NULL, so the user's first claim never trips the gate even if
 * the column was populated by the auto-generator (which leaves it
 * NULL on purpose).
 *
 * Validation order is important:
 *   1. Format + reserved (cheap, no DB).
 *   2. Cooldown (one DB read of the user row).
 *   3. Atomic write — collision check + UPDATE + redirect insert
 *      run in a single transaction inside the repository.
 *
 * Threat-model notes (secure-code-guardian):
 *   - Reserved match is case-insensitive — "ADMIN" rejected.
 *   - Generic "Username không khả dụng" on collision so an attacker
 *     can't enumerate which usernames are taken vs reserved vs in
 *     redirect grace.
 *   - SQL is parameterized end-to-end; LOWER() comparisons happen
 *     server-side.
 *
 * @param {string} userId
 * @param {string} username — raw input from the client
 * @returns {Promise<{ username, is_first_set, redirect_expires_at }>}
 */
async function setUsernameValidated(userId, username) {
  // 1. Format + reserved-list gate (pure, no DB).
  const v = validateUsername(username);
  if (!v.valid) {
    const err = new Error(v.errorMsg);
    err.status = 400;
    err.code = v.errorCode;
    throw err;
  }

  // 2. Cooldown check — fetch the user's last_username_change_at.
  const { query } = require("../config/db");
  const userRow = await query(
    `SELECT username, last_username_change_at
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
    [userId],
  );
  if (userRow.rows.length === 0) {
    const err = new Error("Không tìm thấy tài khoản.");
    err.status = 404;
    throw err;
  }
  const cooldown = canChangeUsername(userRow.rows[0]);
  if (!cooldown.allowed) {
    const err = new Error(`Bạn cần đợi ${cooldown.retryAfterDays} ngày mới đổi được username tiếp theo.`);
    err.status = 429;
    err.code = "USERNAME_COOLDOWN";
    err.data = { retry_after_days: cooldown.retryAfterDays };
    throw err;
  }

  // 3. Atomic write (collision check + UPDATE + redirect insert).
  return repo.changeUsernameAtomic(userId, username, redirectExpiresAt());
}

async function getOrCreateQrToken(userId) {
  const user = await repo.getUserById(userId);
  if (user?.qr_token) return user.qr_token;
  return repo.generateQrToken(userId);
}

async function getSocialProfile(userId) {
  const user = await repo.getUserById(userId);
  return {
    username: user?.username || null,
    qrToken: user?.qr_token || null,
    friendCount: user?.friend_count ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Pings
// ---------------------------------------------------------------------------

async function sendPing(senderId, receiverUserId, templateKey) {
  // Verify friendship
  if (!(await repo.isFriend(senderId, receiverUserId))) {
    const err = new Error("Can only ping friends");
    err.status = 403;
    throw err;
  }

  // One ping per friend per day
  if (await repo.hasPingedToday(senderId, receiverUserId)) {
    const err = new Error("Already pinged this friend today");
    err.status = 429;
    throw err;
  }

  const ping = await repo.createPing(senderId, receiverUserId, templateKey);

  // Notify receiver
  const sender = await repo.getUserById(senderId);
  await repo.createNotification(receiverUserId, "accountability_ping", {
    senderName: sender?.name || "A friend",
    senderId,
    templateKey,
  });

  return ping;
}

async function getPingsReceived(userId) {
  return repo.getPingsReceived(userId);
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

async function getNotifications(userId) {
  const [notifications, unreadCount] = await Promise.all([
    repo.getNotifications(userId),
    repo.getUnreadCount(userId),
  ]);
  return { notifications, unreadCount };
}

async function markNotificationRead(userId, notificationId) {
  return repo.markNotificationRead(notificationId, userId);
}

async function markAllNotificationsRead(userId) {
  return repo.markAllNotificationsRead(userId);
}

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getFriends,
  getOrCreateUsername,
  setUsernameValidated,
  getOrCreateQrToken,
  getSocialProfile,
  sendPing,
  getPingsReceived,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
