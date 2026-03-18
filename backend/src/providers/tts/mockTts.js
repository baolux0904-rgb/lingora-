/**
 * mockTts.js
 *
 * Mock TTS provider for development. Returns empty buffer.
 * Frontend handles mock mode by not requesting audio.
 */

module.exports = {
  async synthesize(/* text, options */) {
    return Buffer.alloc(0);
  },

  isAvailable() {
    return false; // mock provider signals "no audio available"
  },
};
