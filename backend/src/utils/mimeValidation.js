/**
 * utils/mimeValidation.js
 *
 * Magic-byte MIME validation + size enforcement for user-supplied uploads
 * (avatars, voice notes, future media). Refuses to trust client-asserted
 * Content-Type — sniffs the binary header via file-type@16 (pure CJS).
 *
 * SVG and HTML payloads (XSS vectors when re-served via static or R2) are
 * rejected outright: SVG has no magic header that file-type recognises as
 * an "image", and HTML/octet-stream are treated as unknown → reject.
 *
 * Pairs with utils/imageReencode for full polyglot mitigation: validation
 * gates the body, re-encoding strips trailing bytes (e.g. JPEG-of-JS).
 */

"use strict";

const fileType = require("file-type"); // v16.x CJS — exposes fromBuffer

const IMAGE_WHITELIST = new Set(["image/jpeg", "image/png", "image/webp"]);
// NOTE: browser MediaRecorder produces a WebM/EBML container even when the
// payload is audio-only; file-type@16 reports that container as video/webm
// regardless of inner codec, so we must accept it here. The size cap and
// the fact that the route is gated as a "voice note" endpoint bound abuse.
// WAV detection in file-type@16 returns mime: "audio/vnd.wave".
const AUDIO_WHITELIST = new Set([
  "audio/webm",
  "video/webm",     // MediaRecorder audio-only output
  "audio/mpeg",     // .mp3
  "audio/mp4",      // .m4a
  "audio/ogg",
  "audio/wav",
  "audio/x-wav",
  "audio/vnd.wave", // RIFF/WAVE detected by file-type@16
]);

const DEFAULT_IMAGE_MAX = 1 * 1024 * 1024; // 1 MB
const DEFAULT_AUDIO_MAX = 5 * 1024 * 1024; // 5 MB

class ValidationError extends Error {
  constructor(message, code, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

/**
 * Decode a `data:<mime>;base64,<payload>` string OR raw base64 → Buffer.
 * Returns null on malformed input. Caller decides the rejection message.
 *
 * @param {string} input
 * @returns {Buffer|null}
 */
function decodeBase64Loose(input) {
  if (typeof input !== "string" || input.length === 0) return null;
  const stripped = input.replace(/^data:[^;]+;base64,/, "");
  if (stripped.length === 0) return null;
  try {
    const buf = Buffer.from(stripped, "base64");
    // Buffer.from with "base64" silently drops invalid chars; ensure non-empty
    return buf.length > 0 ? buf : null;
  } catch {
    return null;
  }
}

/**
 * Validate an image buffer by magic bytes + size cap.
 *
 * @param {Buffer} buffer
 * @param {object} [options]
 * @param {number} [options.maxSize] – byte cap (default 1MB)
 * @returns {Promise<{ mime: string, ext: string, size: number }>}
 * @throws {ValidationError}
 */
async function validateImageBuffer(buffer, options = {}) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new ValidationError("Image payload is empty or invalid.", "INVALID_IMAGE");
  }
  const maxSize = options.maxSize ?? DEFAULT_IMAGE_MAX;
  if (buffer.length > maxSize) {
    throw new ValidationError(
      `Image too large (${buffer.length} bytes, max ${maxSize}).`,
      "IMAGE_TOO_LARGE",
      413,
    );
  }
  const detected = await fileType.fromBuffer(buffer);
  if (!detected) {
    throw new ValidationError("Could not detect image format.", "INVALID_IMAGE");
  }
  if (!IMAGE_WHITELIST.has(detected.mime)) {
    throw new ValidationError(
      `Unsupported image type: ${detected.mime}. Allowed: ${[...IMAGE_WHITELIST].join(", ")}.`,
      "INVALID_IMAGE",
    );
  }
  return { mime: detected.mime, ext: detected.ext, size: buffer.length };
}

/**
 * Validate an audio buffer by magic bytes + size cap.
 *
 * @param {Buffer} buffer
 * @param {object} [options]
 * @param {number} [options.maxSize] – byte cap (default 5MB)
 * @returns {Promise<{ mime: string, ext: string, size: number }>}
 * @throws {ValidationError}
 */
async function validateAudioBuffer(buffer, options = {}) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new ValidationError("Audio payload is empty or invalid.", "INVALID_AUDIO");
  }
  const maxSize = options.maxSize ?? DEFAULT_AUDIO_MAX;
  if (buffer.length > maxSize) {
    throw new ValidationError(
      `Audio too large (${buffer.length} bytes, max ${maxSize}).`,
      "AUDIO_TOO_LARGE",
      413,
    );
  }
  const detected = await fileType.fromBuffer(buffer);
  if (!detected) {
    throw new ValidationError("Could not detect audio format.", "INVALID_AUDIO");
  }
  if (!AUDIO_WHITELIST.has(detected.mime)) {
    throw new ValidationError(
      `Unsupported audio type: ${detected.mime}.`,
      "INVALID_AUDIO",
    );
  }
  return { mime: detected.mime, ext: detected.ext, size: buffer.length };
}

module.exports = {
  ValidationError,
  validateImageBuffer,
  validateAudioBuffer,
  decodeBase64Loose,
  IMAGE_WHITELIST,
  AUDIO_WHITELIST,
  DEFAULT_IMAGE_MAX,
  DEFAULT_AUDIO_MAX,
};
