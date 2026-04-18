/**
 * mediaService.js
 *
 * Generates pre-signed upload/download URLs via the active storage provider.
 * Domain-agnostic — any module that needs to upload files uses this service.
 */

const crypto = require("crypto");
const { createStorageProvider } = require("../providers/storage/storageProvider");

const storage = createStorageProvider();

/**
 * Generate a pre-signed upload URL for an audio recording.
 *
 * @param {string} userId
 * @param {string} promptId    – speaking_prompt.id, used in the storage key path
 * @param {string} [contentType="audio/webm"]
 * @returns {Promise<{ uploadUrl: string, storageKey: string }>}
 */
async function getUploadUrl(userId, promptId, contentType = "audio/webm") {
  const fileId = crypto.randomUUID();
  const ext = contentType === "audio/webm" ? "webm" : "bin";
  const storageKey = `audio/${userId}/${promptId}/${fileId}.${ext}`;

  const { uploadUrl } = await storage.generateUploadUrl(storageKey, contentType, 300);

  return { uploadUrl, storageKey };
}

/**
 * Generate a pre-signed upload URL for a scenario/IELTS session audio turn.
 *
 * Mirrors `getUploadUrl` (pronunciation) but uses a scenario-scoped key path
 * so R2 listings can be browsed by session. One fileId per call — the caller
 * does not need to pass turnIndex (turns are recorded one at a time and we
 * always generate a fresh key).
 *
 * @param {string} userId
 * @param {string} sessionId
 * @param {string} [contentType="audio/webm"]
 * @returns {Promise<{ uploadUrl: string, storageKey: string, expiresIn: number }>}
 */
async function getScenarioAudioUploadUrl(userId, sessionId, contentType = "audio/webm") {
  const fileId = crypto.randomUUID();
  const ext = contentType === "audio/webm" ? "webm" : "bin";
  const storageKey = `scenarios/${userId}/${sessionId}/${fileId}.${ext}`;
  const expiresIn = 300;

  const { uploadUrl } = await storage.generateUploadUrl(storageKey, contentType, expiresIn);

  return { uploadUrl, storageKey, expiresIn };
}

/**
 * Fetch the raw bytes stored under a given key. Used by the scenario service
 * to hand an audio blob to the Whisper provider.
 *
 * @param {string} storageKey
 * @returns {Promise<Buffer>}
 */
async function getObjectBuffer(storageKey) {
  const url = await storage.generateDownloadUrl(storageKey, 300);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`mediaService.getObjectBuffer: download failed (${res.status}) for key ${storageKey}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Get a download URL for a stored object.
 *
 * @param {string} storageKey
 * @returns {Promise<string>}
 */
async function getDownloadUrl(storageKey) {
  return storage.generateDownloadUrl(storageKey, 300);
}

module.exports = {
  getUploadUrl,
  getScenarioAudioUploadUrl,
  getObjectBuffer,
  getDownloadUrl,
};
