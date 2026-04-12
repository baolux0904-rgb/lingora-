/**
 * services/chatService.js
 *
 * Business logic for 1:1 friend chat.
 */

"use strict";

const chatRepo = require("../repositories/chatRepository");
const { isFriend } = require("../repositories/socialRepository");

async function getConversations(userId) {
  return chatRepo.getConversations(userId);
}

async function sendMessage(senderId, receiverId, { type, content, audioUrl, audioDuration }) {
  // Verify friendship
  if (!(await isFriend(senderId, receiverId))) {
    const err = new Error("Can only message friends");
    err.status = 403;
    throw err;
  }

  if (type === "text" && (!content || !content.trim())) {
    const err = new Error("Message content required");
    err.status = 400;
    throw err;
  }

  const message = await chatRepo.createMessage(
    senderId, receiverId, type,
    type === "text" ? content.trim() : null,
    audioUrl || null,
    audioDuration || null
  );

  return message;
}

async function getMessages(userId, friendId, { limit = 50, before = null } = {}) {
  if (!(await isFriend(userId, friendId))) {
    const err = new Error("Can only view messages with friends");
    err.status = 403;
    throw err;
  }

  // Mark as seen
  await chatRepo.markSeen(userId, friendId);

  const messages = await chatRepo.getMessages(userId, friendId, limit + 1, before);
  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();

  return { messages, hasMore };
}

async function markSeen(userId, friendId) {
  await chatRepo.markSeen(userId, friendId);
}

async function deleteMessage(messageId, userId) {
  await chatRepo.deleteMessage(messageId, userId);
}

async function getUnreadCount(userId) {
  return chatRepo.getUnreadCount(userId);
}

module.exports = { getConversations, sendMessage, getMessages, markSeen, deleteMessage, getUnreadCount };
