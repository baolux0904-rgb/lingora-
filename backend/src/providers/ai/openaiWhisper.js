/**
 * openaiWhisper.js
 *
 * Real OpenAI Whisper implementation. Posts an audio buffer to
 * `audio.transcriptions.create` with `response_format: 'verbose_json'` and
 * timestamp_granularities=['segment'] so the caller gets segment-level
 * timings for pause / WPM computation.
 *
 * Safety:
 *  - 30s timeout (Whisper can be slow on long clips)
 *  - Throws on API failure — the caller is expected to retry with backoff.
 *  - Always returns the spec'd `TranscriptionResult` shape (no partial objects)
 *
 * @module providers/ai/openaiWhisper
 */

"use strict";

const OpenAI = require("openai");

const WHISPER_TIMEOUT_MS = 30_000;
const WHISPER_MODEL = "whisper-1";

let _client = null;

function getClient() {
  if (_client) return _client;
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required for OpenAI Whisper provider");
  }
  _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

/**
 * @param {Buffer} audioBuffer
 * @param {string} [language='en']
 * @returns {Promise<{transcript: string, durationSeconds: number, segments: Array<{start:number,end:number,text:string}>}>}
 */
async function transcribeAudio(audioBuffer, language = "en") {
  if (!Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) {
    throw new TypeError("transcribeAudio: audioBuffer must be a non-empty Buffer");
  }

  const client = getClient();
  // OpenAI SDK accepts a File-like object; Node 18+ has a global `File` via
  // undici. Fall back to a Blob-with-name wrapper if the runtime lacks File.
  const filename = `audio-${Date.now()}.webm`;
  const file = typeof File !== "undefined"
    ? new File([audioBuffer], filename, { type: "audio/webm" })
    : await (async () => {
        // Last resort: openai SDK also accepts a Readable stream with a name.
        const { Readable } = require("stream");
        const stream = Readable.from(audioBuffer);
        stream.path = filename;
        return stream;
      })();

  const call = client.audio.transcriptions.create({
    file,
    model: WHISPER_MODEL,
    language,
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

  const raced = await Promise.race([
    call,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Whisper request timed out after ${WHISPER_TIMEOUT_MS}ms`)), WHISPER_TIMEOUT_MS),
    ),
  ]);

  const transcript = typeof raced.text === "string" ? raced.text.trim() : "";
  const durationSeconds = typeof raced.duration === "number" ? raced.duration : 0;
  const segments = Array.isArray(raced.segments)
    ? raced.segments.map((s) => ({
        start: Number(s.start) || 0,
        end: Number(s.end) || 0,
        text: typeof s.text === "string" ? s.text.trim() : "",
      }))
    : [];

  return { transcript, durationSeconds, segments };
}

module.exports = { transcribeAudio };
