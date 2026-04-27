/**
 * mockStorage.js
 *
 * In-memory storage provider for development.
 * Stores audio blobs in a Map keyed by object key.
 * Upload/download URLs point to a local Express route (see app.js mock mount).
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

/** @type {Map<string, Buffer>} */
const store = new Map();

/**
 * @param {string} key
 * @param {string} _contentType
 * @param {number} [_expiresInSeconds]
 * @returns {Promise<{ uploadUrl: string, publicUrl: string }>}
 */
async function generateUploadUrl(key, _contentType, _expiresInSeconds = 300) {
  const encodedKey = encodeURIComponent(key);
  return {
    uploadUrl: `${BASE_URL}/mock-storage/${encodedKey}`,
    publicUrl: `${BASE_URL}/mock-storage/${encodedKey}`,
  };
}

/**
 * @param {string} key
 * @param {number} [_expiresInSeconds]
 * @returns {Promise<string>}
 */
async function generateDownloadUrl(key, _expiresInSeconds = 300) {
  const encodedKey = encodeURIComponent(key);
  return `${BASE_URL}/mock-storage/${encodedKey}`;
}

/**
 * @param {string} key
 * @returns {Promise<void>}
 */
async function deleteObject(key) {
  store.delete(key);
}

/**
 * Direct server-side upload (used by avatar/voice flows that buffer the
 * payload at the API and persist after validation+re-encode).
 *
 * @param {string} key
 * @param {Buffer|Uint8Array} body
 * @param {string} _contentType
 * @returns {Promise<{ key: string }>}
 */
async function uploadObject(key, body, _contentType) {
  store.set(key, Buffer.isBuffer(body) ? body : Buffer.from(body));
  return { key };
}

/**
 * Stable URL pointing to the locally-served mock storage route.
 * Used by avatars/voice notes so we don't have to refresh signed URLs.
 *
 * @param {string} key
 * @returns {string}
 */
function composePublicUrl(key) {
  return `${BASE_URL}/mock-storage/${encodeURIComponent(key)}`;
}

// ── Helpers for the mock Express routes ──

/** Store a buffer for the given key. */
function _put(key, buffer) {
  store.set(key, buffer);
}

/** Retrieve a buffer by key (or undefined). */
function _get(key) {
  return store.get(key);
}

module.exports = {
  generateUploadUrl,
  generateDownloadUrl,
  deleteObject,
  uploadObject,
  composePublicUrl,
  _put,
  _get,
};
