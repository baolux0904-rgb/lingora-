/**
 * controllers/chatController.js
 *
 * HTTP layer for friend chat.
 */

const chatService = require("../services/chatService");
const { sendSuccess, sendError } = require("../response");
const events = require("../socket/events");
const { decodeBase64Loose, validateAudioBuffer, ValidationError } = require("../utils/mimeValidation");
const { createStorageProvider } = require("../providers/storage/storageProvider");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getConversations(req, res, next) {
  try {
    const conversations = await chatService.getConversations(req.user.id);
    return sendSuccess(res, { data: { conversations }, message: "Conversations retrieved" });
  } catch (err) { next(err); }
}

async function getMessages(req, res, next) {
  try {
    const { friendId } = req.params;
    if (!UUID_RE.test(friendId)) return sendError(res, { status: 400, message: "Valid friendId required" });
    const { limit, before, after } = req.query;

    if (before && after) {
      return sendError(res, { status: 400, message: "Cannot specify both before and after" });
    }
    if (before && isNaN(Date.parse(before))) {
      return sendError(res, { status: 400, message: "Invalid before timestamp" });
    }
    if (after && isNaN(Date.parse(after))) {
      return sendError(res, { status: 400, message: "Invalid after timestamp" });
    }

    const result = await chatService.getMessages(req.user.id, friendId, {
      limit: limit ? parseInt(limit, 10) : 50,
      before: before || null,
      after: after || null,
    });
    return sendSuccess(res, { data: result, message: "Messages retrieved" });
  } catch (err) { next(err); }
}

async function sendTextMessage(req, res, next) {
  try {
    const { friendId } = req.params;
    if (!UUID_RE.test(friendId)) return sendError(res, { status: 400, message: "Valid friendId required" });
    const { content, client_message_id, clientMessageId } = req.body;
    if (!content || typeof content !== "string") return sendError(res, { status: 400, message: "content required" });

    const cid = client_message_id || clientMessageId || null;
    if (cid && !UUID_RE.test(cid)) {
      return sendError(res, { status: 400, message: "Invalid client_message_id" });
    }

    const { message, created } = await chatService.sendMessage(req.user.id, friendId, { type: "text", content, clientMessageId: cid });

    // Only emit on first insert — idempotent retries would double-deliver the bubble.
    if (created) {
      const io = req.app.get("io");
      if (io) {
        io.to(`user:${friendId}`).emit("new_message", message);
        // Sync sender's other devices (multi-device dedup of optimistic bubble).
        io.to(`user:${req.user.id}`).emit(events.MESSAGE_DELIVERED, {
          message_id: message.id,
          client_message_id: message.client_message_id,
        });
      }
    }

    return sendSuccess(res, { data: message, status: 201, message: "Message sent" });
  } catch (err) { next(err); }
}

async function sendVoiceMessage(req, res, next) {
  try {
    const { friendId } = req.params;
    if (!UUID_RE.test(friendId)) return sendError(res, { status: 400, message: "Valid friendId required" });
    const { audio, duration, client_message_id, clientMessageId, waveform_peaks, waveformPeaks } = req.body;
    if (!audio) return sendError(res, { status: 400, message: "audio (base64) required", code: "AUDIO_REQUIRED" });

    const cid = client_message_id || clientMessageId || null;
    if (cid && !UUID_RE.test(cid)) {
      return sendError(res, { status: 400, message: "Invalid client_message_id" });
    }

    const peaks = waveform_peaks ?? waveformPeaks ?? null;

    // 1. Decode base64 → Buffer (null-safe; rejects bad payloads).
    const buffer = decodeBase64Loose(audio);
    if (!buffer) {
      return sendError(res, { status: 400, message: "Invalid base64 audio payload.", code: "INVALID_AUDIO" });
    }

    // 2. Magic-byte validation: rejects HTML / octet-stream payloads disguised
    //    as audio (XSS vector if served via static / R2). 5 MB cap matches
    //    Chat UI's 60s recorder ceiling at typical webm bitrate.
    let detected;
    try {
      detected = await validateAudioBuffer(buffer, { maxSize: 5 * 1024 * 1024 });
    } catch (err) {
      if (err instanceof ValidationError) {
        return sendError(res, { status: err.status, message: err.message, code: err.code });
      }
      throw err;
    }

    // 3. Upload to storage provider (R2 in prod, mock in dev).
    //    storageKey uses a fresh UUID so DB delete cleans up its own row's
    //    file; extension reflects detected MIME (not client-claimed).
    const storage = createStorageProvider();
    const storageId = require("crypto").randomUUID();
    const ext = detected.ext === "mp3" ? "mp3" : detected.ext === "wav" ? "wav" : detected.ext === "ogg" ? "ogg" : detected.ext === "m4a" ? "m4a" : "webm";
    const key = `voice-notes/${storageId}.${ext}`;
    try {
      await storage.uploadObject(key, buffer, detected.mime);
    } catch (uploadErr) {
      console.error(`[chat] voice upload failed user=${req.user.id} friend=${friendId}:`, uploadErr.message);
      return sendError(res, { status: 503, message: "Voice upload failed. Please retry.", code: "STORAGE_UNAVAILABLE" });
    }

    const audioUrl = await storage.composePublicUrl(key);

    // 4. Persist message row pointing at the stored object. If sendMessage
    //    throws (e.g. DB hiccup), best-effort delete the orphan blob.
    let result;
    try {
      result = await chatService.sendMessage(req.user.id, friendId, {
        type: "voice",
        audioUrl,
        audioDuration: duration || 0,
        clientMessageId: cid,
        waveformPeaks: peaks,
      });
    } catch (dbErr) {
      console.error(`[chat] sendMessage DB failure after upload — cleaning orphan blob ${key}:`, dbErr.message);
      try { await storage.deleteObject(key); } catch (cleanupErr) {
        console.error(`[chat] orphan blob cleanup failed for ${key}:`, cleanupErr.message);
      }
      throw dbErr;
    }

    const { message, created } = result;
    if (created) {
      const io = req.app.get("io");
      if (io) {
        io.to(`user:${friendId}`).emit("new_message", message);
        io.to(`user:${req.user.id}`).emit(events.MESSAGE_DELIVERED, {
          message_id: message.id,
          client_message_id: message.client_message_id,
        });
      }
    }

    return sendSuccess(res, { data: message, status: 201, message: "Voice note sent" });
  } catch (err) { next(err); }
}

async function markSeen(req, res, next) {
  try {
    const { friendId } = req.params;
    if (!UUID_RE.test(friendId)) return sendError(res, { status: 400, message: "Valid friendId required" });
    await chatService.markSeen(req.user.id, friendId);

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${friendId}`).emit("messages_seen", { userId: req.user.id });
    }

    return sendSuccess(res, { message: "Marked as seen" });
  } catch (err) { next(err); }
}

async function deleteMsg(req, res, next) {
  try {
    const { messageId } = req.params;
    if (!UUID_RE.test(messageId)) return sendError(res, { status: 400, message: "Valid messageId required" });
    await chatService.deleteMessage(messageId, req.user.id);
    return sendSuccess(res, { message: "Message deleted" });
  } catch (err) { next(err); }
}

module.exports = { getConversations, getMessages, sendTextMessage, sendVoiceMessage, markSeen, deleteMessage: deleteMsg };
