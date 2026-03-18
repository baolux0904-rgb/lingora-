/**
 * ttsProvider.js
 *
 * Factory that returns the active TTS provider based on TTS_PROVIDER env.
 *
 * --- Provider interface ---
 *
 * Every TTS provider must export an object with:
 *
 *   synthesize(text, options?)
 *     @param {string} text          - Text to convert to speech
 *     @param {object} [options]     - e.g. { voice, speed }
 *     @returns {Promise<Buffer>}    - Audio data (mp3)
 *
 *   isAvailable()
 *     @returns {boolean}            - Whether the provider is configured and ready
 */

let _provider = null;

function createTtsProvider() {
  if (_provider) return _provider;

  const provider = process.env.TTS_PROVIDER || "mock";

  switch (provider) {
    case "openai":
      _provider = require("./openaiTts");
      break;
    case "mock":
    default:
      _provider = require("./mockTts");
      break;
  }

  return _provider;
}

module.exports = { createTtsProvider };
