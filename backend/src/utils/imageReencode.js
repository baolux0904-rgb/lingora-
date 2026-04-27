/**
 * utils/imageReencode.js
 *
 * Re-encodes a validated image buffer through sharp to strip polyglot
 * payloads. Even if magic-byte validation passed, the trailing bytes of
 * a JPEG file can hide arbitrary data (PHP-in-JPEG, JS-in-PNG, ZIP
 * archives appended after the IEND marker, etc). Re-encoding to a
 * canonical JPEG/PNG/WebP discards anything outside the parsed image
 * data — the output is provably the rendered pixels and nothing else.
 *
 * Output policy:
 *   - All inputs → JPEG quality 85 by default (smaller files, browser
 *     compatible). PNG retained for transparency-required cases.
 *   - Strips EXIF + ICC profiles (privacy + payload elimination).
 *   - Caps dimensions to MAX_DIMENSION (default 2048) — prevents
 *     pixel-bomb DoS during decode.
 */

"use strict";

const sharp = require("sharp");

const MAX_DIMENSION = 2048;

/**
 * Re-encode an already-validated image buffer to a canonical format.
 *
 * @param {Buffer} buffer    – validated image bytes (jpeg/png/webp)
 * @param {object} [options]
 * @param {string} [options.format='jpeg'] – output format ('jpeg'|'png'|'webp')
 * @param {number} [options.quality=85]    – JPEG/WebP quality (1-100)
 * @param {number} [options.maxDimension=2048] – cap longest side
 * @returns {Promise<{ buffer: Buffer, mime: string, ext: string, width: number, height: number }>}
 */
async function reEncodeImage(buffer, options = {}) {
  const format = options.format || "jpeg";
  const quality = options.quality ?? 85;
  const maxDim = options.maxDimension ?? MAX_DIMENSION;

  // sharp() reads only the parsed image stream — anything appended after
  // the format's EOF marker is ignored.
  const pipeline = sharp(buffer, { failOn: "error" }).rotate(); // honours EXIF orientation, then strips it

  // Resize-down only (no upscale) so small avatars stay small.
  pipeline.resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true });

  let outBuf;
  let mime;
  let ext;
  switch (format) {
    case "png":
      outBuf = await pipeline.png({ compressionLevel: 9 }).toBuffer();
      mime = "image/png";
      ext = "png";
      break;
    case "webp":
      outBuf = await pipeline.webp({ quality }).toBuffer();
      mime = "image/webp";
      ext = "webp";
      break;
    case "jpeg":
    default:
      outBuf = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
      mime = "image/jpeg";
      ext = "jpg";
      break;
  }

  // Re-read metadata for confirmation (cheap on the encoded buffer).
  const meta = await sharp(outBuf).metadata();
  return {
    buffer: outBuf,
    mime,
    ext,
    width: meta.width,
    height: meta.height,
  };
}

module.exports = { reEncodeImage, MAX_DIMENSION };
