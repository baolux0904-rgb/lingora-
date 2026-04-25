/**
 * lib/extractAudio.js
 *
 * Reads MP3 metadata for the 4 parts of a test using music-metadata.
 * Throws a clear error if any part is missing.
 */

"use strict";

const fs = require("fs");
const path = require("path");

/**
 * @param {string} audioFolderPath
 * @param {number} testNumber
 * @returns {Promise<{ part1: PartInfo, part2: PartInfo, part3: PartInfo, part4: PartInfo, totalDurationSeconds: number }>}
 *
 * @typedef {Object} PartInfo
 * @property {number} durationSeconds
 * @property {string} localPath
 * @property {number} bitrate
 */
async function extractAudioMetadata(audioFolderPath, testNumber) {
  const mm = await import("music-metadata"); // ESM-only package
  const out = { totalDurationSeconds: 0 };
  for (let p = 1; p <= 4; p++) {
    const fname = `test${testNumber}_part${p}.mp3`;
    const fpath = path.join(audioFolderPath, fname);
    if (!fs.existsSync(fpath)) {
      throw new Error(`audio file missing: ${fpath}`);
    }
    const meta = await mm.parseFile(fpath);
    const dur = Math.round(meta.format.duration || 0);
    if (dur < 30) {
      throw new Error(`audio ${fname} duration suspiciously short: ${dur}s`);
    }
    out[`part${p}`] = {
      durationSeconds: dur,
      localPath: fpath,
      bitrate: meta.format.bitrate || 0,
    };
    out.totalDurationSeconds += dur;
  }
  return out;
}

module.exports = { extractAudioMetadata };
