/**
 * whisperProvider.js
 *
 * Factory for speech-to-text providers. Default wraps OpenAI Whisper
 * (whisper-1) with verbose JSON output so we get segment timestamps for
 * server-side WPM / pause / ratio computation.
 *
 * ─── Provider interface ───
 *
 *   transcribeAudio(audioBuffer, language = 'en')
 *     @param {Buffer} audioBuffer   – raw audio bytes (webm/opus, mp3, wav…)
 *     @param {string} [language='en']
 *     @returns {Promise<TranscriptionResult>}
 *
 *   TranscriptionResult = {
 *     transcript:       string,        // full text, no timestamps
 *     durationSeconds:  number,        // Whisper-reported audio length
 *     segments: Array<{
 *       start: number,   // seconds from audio start
 *       end:   number,
 *       text:  string,
 *     }>,
 *   }
 *
 * Selection (WHISPER_PROVIDER env):
 *   "openai"           → real Whisper (requires OPENAI_API_KEY)
 *   "mock" (default)   → deterministic local mock for tests/dev
 *
 * @module providers/ai/whisperProvider
 */

"use strict";

let _provider = null;

function createWhisperProvider() {
  if (_provider) return _provider;

  const configured = (process.env.WHISPER_PROVIDER || "mock").toLowerCase();

  switch (configured) {
    case "openai":
      if (!process.env.OPENAI_API_KEY) {
        console.warn("[whisper] OPENAI_API_KEY missing — falling back to mock provider");
        _provider = require("./mockWhisper");
      } else {
        _provider = require("./openaiWhisper");
      }
      break;
    case "mock":
    default:
      if (process.env.NODE_ENV === "production") {
        console.warn(
          "[whisper] WARNING: WHISPER_PROVIDER is 'mock' in production — transcripts will be deterministic placeholders",
        );
      }
      _provider = require("./mockWhisper");
      break;
  }

  console.log(`[whisper] Provider selected: "${configured}"`);
  return _provider;
}

module.exports = { createWhisperProvider };
