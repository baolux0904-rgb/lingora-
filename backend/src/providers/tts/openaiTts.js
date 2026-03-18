/**
 * openaiTts.js
 *
 * OpenAI TTS provider for examiner voice output.
 * Uses OpenAI Audio API to generate speech from text.
 *
 * Env vars:
 *   OPENAI_API_KEY      — API key (shared with AI provider)
 *   TTS_OPENAI_VOICE    — voice id (default: "alloy")
 *   TTS_OPENAI_MODEL    — model (default: "tts-1")
 *
 * Usage:
 *   Set TTS_PROVIDER=openai in env to activate.
 */

const VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

module.exports = {
  async synthesize(text, options = {}) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required for OpenAI TTS");
    }

    const voice = options.voice || process.env.TTS_OPENAI_VOICE || "alloy";
    const model = options.model || process.env.TTS_OPENAI_MODEL || "tts-1";

    if (!VOICES.includes(voice)) {
      console.warn(`Unknown TTS voice "${voice}", falling back to "alloy"`);
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: text,
        voice,
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Unknown error");
      throw new Error(`OpenAI TTS API error ${response.status}: ${errorBody}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  },

  isAvailable() {
    return !!process.env.OPENAI_API_KEY;
  },
};
