/**
 * lib/uploadAssets.js
 *
 * Upload audio (and optional map images) for a single test to R2.
 *
 * Key conventions:
 *   listening/cam{NN}/test{T}/part{P}.mp3
 *   listening/cam{NN}/test{T}/maps/part{P}.png
 *
 * Existence check via HeadObjectCommand (cheap) so re-runs are idempotent.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const {
  S3Client,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");
const { uploadObject } = require("../../../src/providers/storage/r2Storage");

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME || "lingora-audio";

let _client = null;
function getHeadClient() {
  if (_client) return _client;
  _client = new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY },
  });
  return _client;
}

async function existsInR2(key) {
  try {
    await getHeadClient().send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
    return true;
  } catch (err) {
    if (err.$metadata?.httpStatusCode === 404 || err.name === "NotFound") return false;
    throw err;
  }
}

function pad(n) {
  return String(n).padStart(2, "0");
}

/**
 * @param {Object} args
 * @param {number} args.cambridgeBook
 * @param {number} args.testNumber
 * @param {Object} args.audioMeta - output from extractAudioMetadata
 * @param {string} [args.mapsFolderPath]
 * @returns {Promise<{ audioKeys: object, mapKeys: Record<string,string>, bytesUploaded: number, skipped: number }>}
 */
async function uploadAssets({ cambridgeBook, testNumber, audioMeta, mapsFolderPath }) {
  const camDir = `listening/cam${pad(cambridgeBook)}/test${testNumber}`;
  const audioKeys = {};
  const mapKeys = {};
  let bytesUploaded = 0;
  let skipped = 0;

  for (let p = 1; p <= 4; p++) {
    const key = `${camDir}/part${p}.mp3`;
    const local = audioMeta[`part${p}`].localPath;
    if (await existsInR2(key)) {
      console.log(`  [r2] SKIP (exists): ${key}`);
      skipped++;
    } else {
      const buf = fs.readFileSync(local);
      await uploadObject(key, buf, "audio/mpeg");
      bytesUploaded += buf.length;
      console.log(`  [r2] PUT ${key} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
    }
    audioKeys[`part${p}`] = key;
  }

  if (mapsFolderPath && fs.existsSync(mapsFolderPath)) {
    for (let p = 1; p <= 4; p++) {
      const local = path.join(mapsFolderPath, `test${testNumber}_part${p}.png`);
      if (!fs.existsSync(local)) continue;
      const key = `${camDir}/maps/part${p}.png`;
      if (await existsInR2(key)) {
        console.log(`  [r2] SKIP (exists): ${key}`);
        skipped++;
      } else {
        const buf = fs.readFileSync(local);
        await uploadObject(key, buf, "image/png");
        bytesUploaded += buf.length;
        console.log(`  [r2] PUT ${key} (${(buf.length / 1024).toFixed(1)} KB)`);
      }
      mapKeys[`part${p}`] = key;
    }
  }

  return { audioKeys, mapKeys, bytesUploaded, skipped };
}

module.exports = { uploadAssets, existsInR2 };
