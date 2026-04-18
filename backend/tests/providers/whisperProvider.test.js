/**
 * whisperProvider.test.js
 *
 * Covers the factory (env-driven selection) and the mock provider's contract.
 * Real openaiWhisper is not exercised here — it's a thin network wrapper and
 * is validated manually with a live OPENAI_API_KEY during cross-browser QA.
 */

"use strict";

const originalWhisperProvider = process.env.WHISPER_PROVIDER;

afterEach(() => {
  // Reset module cache so the factory singleton doesn't leak between tests.
  jest.resetModules();
  if (originalWhisperProvider === undefined) {
    delete process.env.WHISPER_PROVIDER;
  } else {
    process.env.WHISPER_PROVIDER = originalWhisperProvider;
  }
});

describe('createWhisperProvider', () => {
  it('defaults to mock when WHISPER_PROVIDER is unset', () => {
    delete process.env.WHISPER_PROVIDER;
    const { createWhisperProvider } = require('../../src/providers/ai/whisperProvider');
    const provider = createWhisperProvider();
    // Mock provider exposes its fixtures; real openaiWhisper does not.
    expect(typeof provider.transcribeAudio).toBe('function');
    expect(provider.__fixtures__).toBeDefined();
  });

  it('falls back to mock when openai is requested but OPENAI_API_KEY missing', () => {
    jest.resetModules();
    process.env.WHISPER_PROVIDER = 'openai';
    const original = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    try {
      const { createWhisperProvider } = require('../../src/providers/ai/whisperProvider');
      const provider = createWhisperProvider();
      expect(provider.__fixtures__).toBeDefined(); // mock provider
    } finally {
      if (original !== undefined) process.env.OPENAI_API_KEY = original;
    }
  });
});

describe('mockWhisper.transcribeAudio', () => {
  const { transcribeAudio, __fixtures__ } = require('../../src/providers/ai/mockWhisper');

  it('returns the spec TranscriptionResult shape', async () => {
    const result = await transcribeAudio(Buffer.from('fake webm bytes'));
    expect(Object.keys(result).sort()).toEqual(['durationSeconds', 'segments', 'transcript']);
    expect(typeof result.transcript).toBe('string');
    expect(result.transcript.length).toBeGreaterThan(0);
    expect(typeof result.durationSeconds).toBe('number');
    expect(Array.isArray(result.segments)).toBe(true);
  });

  it('returns deterministic fixtures', async () => {
    const a = await transcribeAudio(Buffer.from('anything'));
    const b = await transcribeAudio(Buffer.from('else'));
    expect(a.transcript).toBe(b.transcript);
    expect(a.transcript).toBe(__fixtures__.MOCK_TRANSCRIPT);
    expect(a.durationSeconds).toBe(__fixtures__.MOCK_DURATION);
  });

  it('segments cover the transcript in order with monotonic timestamps', async () => {
    const { segments } = await transcribeAudio(Buffer.from('x'));
    for (let i = 0; i < segments.length; i++) {
      expect(segments[i].end).toBeGreaterThan(segments[i].start);
      if (i > 0) {
        expect(segments[i].start).toBeGreaterThanOrEqual(segments[i - 1].end);
      }
    }
  });

  it('throws TypeError on empty / non-Buffer input', async () => {
    await expect(transcribeAudio(null)).rejects.toThrow(TypeError);
    await expect(transcribeAudio(Buffer.alloc(0))).rejects.toThrow(TypeError);
    await expect(transcribeAudio('not a buffer')).rejects.toThrow(TypeError);
  });
});
