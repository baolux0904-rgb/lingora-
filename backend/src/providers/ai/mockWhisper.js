/**
 * mockWhisper.js
 *
 * Deterministic offline mock for the Whisper provider. Returns a fixed
 * transcript + plausible segment timings so downstream code
 * (speechMetrics + speechAnalyzer + IELTS state machine) has real-ish data
 * to work with in local dev and tests without hitting the OpenAI API.
 *
 * @module providers/ai/mockWhisper
 */

"use strict";

// Canonical sample answer — long enough to produce multiple segments so
// pause-count / ratio logic exercises realistic data paths.
const MOCK_TRANSCRIPT = [
  "Well, I would say my hometown is a fairly quiet place.",
  "It's on the coast, and most people there work in fishing or tourism.",
  "I've lived there my whole life, so I know every street.",
].join(" ");

const MOCK_SEGMENTS = [
  { start: 0.0,  end: 3.2,  text: "Well, I would say my hometown is a fairly quiet place." },
  { start: 3.6,  end: 8.1,  text: "It's on the coast, and most people there work in fishing or tourism." },
  { start: 8.7,  end: 12.4, text: "I've lived there my whole life, so I know every street." },
];

const MOCK_DURATION = 12.4;

/**
 * @param {Buffer} audioBuffer  - ignored, kept for interface parity
 * @param {string} [_language='en']
 */
async function transcribeAudio(audioBuffer, _language = "en") {
  if (!Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) {
    throw new TypeError("transcribeAudio: audioBuffer must be a non-empty Buffer");
  }
  // Tiny simulated latency so callers that race against timeouts don't short-circuit
  await new Promise((r) => setTimeout(r, 20));
  return {
    transcript: MOCK_TRANSCRIPT,
    durationSeconds: MOCK_DURATION,
    segments: MOCK_SEGMENTS.map((s) => ({ ...s })),
  };
}

module.exports = { transcribeAudio, __fixtures__: { MOCK_TRANSCRIPT, MOCK_SEGMENTS, MOCK_DURATION } };
