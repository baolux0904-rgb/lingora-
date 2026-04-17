const {
  safeJsonParse,
  validateSchema,
  filterKnownSignals,
  verifyEvidence,
  processWritingOutput,
  processSpeakingOutput,
} = require('../../../src/domain/ielts/postProcessor');

// ════════════════════════════════════════════════════════════════
// safeJsonParse
// ════════════════════════════════════════════════════════════════

describe('safeJsonParse', () => {
  it('parses plain JSON', () => {
    expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 });
  });

  it('strips markdown code fences', () => {
    const input = '```json\n{"a":1}\n```';
    expect(safeJsonParse(input)).toEqual({ a: 1 });
  });

  it('strips plain code fences', () => {
    const input = '```\n{"a":1}\n```';
    expect(safeJsonParse(input)).toEqual({ a: 1 });
  });

  it('strips leading text before JSON', () => {
    const input = 'Here is the result: {"a":1}';
    expect(safeJsonParse(input)).toEqual({ a: 1 });
  });

  it('returns null for invalid JSON', () => {
    expect(safeJsonParse('not json')).toBeNull();
    expect(safeJsonParse('{broken')).toBeNull();
  });

  it('returns null for empty / non-string', () => {
    expect(safeJsonParse('')).toBeNull();
    expect(safeJsonParse(null)).toBeNull();
    expect(safeJsonParse(undefined)).toBeNull();
    expect(safeJsonParse(42)).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════
// validateSchema
// ════════════════════════════════════════════════════════════════

describe('validateSchema', () => {
  const validData = {
    lintopus_vi: 'Bài tốt',
    TA: { band: 7, signals_triggered: [], evidence: [] },
    CC: { band: 6, signals_triggered: [], evidence: [] },
    LR: { band: 6, signals_triggered: [], evidence: [] },
    GRA: { band: 6, signals_triggered: [], evidence: [] },
  };

  it('returns null for valid data', () => {
    expect(validateSchema(validData, ['TA', 'CC', 'LR', 'GRA'])).toBeNull();
  });

  it('rejects non-object', () => {
    expect(validateSchema(null, ['TA'])).toBe('not_an_object');
    expect(validateSchema('string', ['TA'])).toBe('not_an_object');
  });

  it('rejects missing lintopus_vi', () => {
    const d = { ...validData };
    delete d.lintopus_vi;
    expect(validateSchema(d, ['TA', 'CC', 'LR', 'GRA'])).toBe('missing_lintopus_vi');
  });

  it('rejects missing criterion', () => {
    const d = { ...validData };
    delete d.TA;
    expect(validateSchema(d, ['TA', 'CC', 'LR', 'GRA'])).toBe('missing_criterion_TA');
  });

  it('rejects non-number band', () => {
    const d = { ...validData, TA: { band: 'seven', signals_triggered: [], evidence: [] } };
    expect(validateSchema(d, ['TA', 'CC', 'LR', 'GRA'])).toBe('TA_band_not_number');
  });

  it('rejects non-array signals', () => {
    const d = { ...validData, TA: { band: 7, signals_triggered: 'none', evidence: [] } };
    expect(validateSchema(d, ['TA', 'CC', 'LR', 'GRA'])).toBe('TA_signals_not_array');
  });
});

// ════════════════════════════════════════════════════════════════
// filterKnownSignals
// ════════════════════════════════════════════════════════════════

describe('filterKnownSignals', () => {
  it('keeps valid signals, rejects unknown', () => {
    const input = ['all_task_parts_addressed', 'made_up_signal', 'clear_position_throughout'];
    const { cleaned, hallucinated } = filterKnownSignals(input);
    expect(cleaned).toContain('all_task_parts_addressed');
    expect(cleaned).toContain('clear_position_throughout');
    expect(cleaned).not.toContain('made_up_signal');
    expect(hallucinated).toEqual(['made_up_signal']);
  });

  it('handles empty array', () => {
    expect(filterKnownSignals([])).toEqual({ cleaned: [], hallucinated: [] });
  });

  it('skips non-string entries', () => {
    const { cleaned, hallucinated } = filterKnownSignals(['all_task_parts_addressed', 42, null]);
    expect(cleaned).toEqual(['all_task_parts_addressed']);
    expect(hallucinated).toEqual([]);
  });
});

// ════════════════════════════════════════════════════════════════
// verifyEvidence
// ════════════════════════════════════════════════════════════════

describe('verifyEvidence', () => {
  const source = 'Technology has transformed education. Students now learn online.';

  it('marks valid quote as invalid=false', () => {
    const ev = [{ quote: 'Students now learn online', issue: 'vague' }];
    const result = verifyEvidence(ev, source);
    expect(result[0].invalid).toBe(false);
  });

  it('marks invented quote as invalid=true', () => {
    const ev = [{ quote: 'This text does not exist', issue: 'hallucination' }];
    const result = verifyEvidence(ev, source);
    expect(result[0].invalid).toBe(true);
  });

  it('normalizes whitespace when matching', () => {
    const ev = [{ quote: 'Students now    learn online', issue: 'test' }];
    const result = verifyEvidence(ev, source);
    expect(result[0].invalid).toBe(false);
  });

  it('is case-insensitive', () => {
    const ev = [{ quote: 'STUDENTS NOW LEARN ONLINE', issue: 'test' }];
    const result = verifyEvidence(ev, source);
    expect(result[0].invalid).toBe(false);
  });

  it('handles smart quotes', () => {
    const sourceWithSmart = 'He said \u201Chello\u201D to them.';
    const ev = [{ quote: '"hello"', issue: 'test' }];
    const result = verifyEvidence(ev, sourceWithSmart);
    expect(result[0].invalid).toBe(false);
  });

  it('returns empty array for non-array input', () => {
    expect(verifyEvidence(null, source)).toEqual([]);
  });

  it('marks missing quote as invalid', () => {
    const ev = [{ issue: 'no quote field' }];
    const result = verifyEvidence(ev, source);
    expect(result[0].invalid).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// processWritingOutput — end-to-end
// ════════════════════════════════════════════════════════════════

describe('processWritingOutput', () => {
  const validLlmOutput = JSON.stringify({
    TA: {
      band: 7,
      signals_triggered: ['all_task_parts_addressed', 'clear_position_throughout'],
      evidence: [],
    },
    CC: {
      band: 6,
      signals_triggered: ['logical_paragraph_structure'],
      evidence: [],
    },
    LR: {
      band: 6,
      signals_triggered: ['word_choice_errors'],
      evidence: [],
    },
    GRA: {
      band: 6.5,
      signals_triggered: ['article_errors', 'subject_verb_agreement_errors'],
      evidence: [],
    },
    lintopus_vi: 'Bài viết khá, cần chú ý article và từ vựng.',
  });

  const sourceEssay = 'In the modern world, technology has changed education significantly.';

  it('returns ok=true for valid output', () => {
    const result = processWritingOutput(validLlmOutput, sourceEssay);
    expect(result.ok).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('recomputes overall band with IELTS rounding', () => {
    // avg = (7 + 6 + 6 + 6.5) / 4 = 6.375 → 6.5
    const result = processWritingOutput(validLlmOutput, sourceEssay);
    expect(result.data.overall).toBe(6.5);
  });

  it('injects deterministic suggestions from rubric', () => {
    const result = processWritingOutput(validLlmOutput, sourceEssay);
    expect(result.data.TA.suggestions.length).toBeGreaterThan(0);
    expect(result.data.CC.suggestions.length).toBeGreaterThan(0);
  });

  it('fails gracefully on malformed JSON', () => {
    const result = processWritingOutput('not json at all', sourceEssay);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('json_parse_failed');
  });

  it('fails on missing criterion', () => {
    const partial = JSON.stringify({
      TA: { band: 7, signals_triggered: [], evidence: [] },
      lintopus_vi: 'ok',
    });
    const result = processWritingOutput(partial, sourceEssay);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/missing_criterion/);
  });

  it('warns on hallucinated signals without failing', () => {
    const withHallucination = JSON.stringify({
      TA: { band: 7, signals_triggered: ['invented_signal_xyz'], evidence: [] },
      CC: { band: 6, signals_triggered: [], evidence: [] },
      LR: { band: 6, signals_triggered: [], evidence: [] },
      GRA: { band: 6, signals_triggered: [], evidence: [] },
      lintopus_vi: 'ok',
    });
    const result = processWritingOutput(withHallucination, sourceEssay);
    expect(result.ok).toBe(true);
    expect(result.warnings.some((w) => w.includes('hallucinated'))).toBe(true);
    expect(result.data.TA.signals_triggered).not.toContain('invented_signal_xyz');
  });

  it('clamps out-of-range band', () => {
    const bad = JSON.stringify({
      TA: { band: 10, signals_triggered: [], evidence: [] }, // >9
      CC: { band: 6, signals_triggered: [], evidence: [] },
      LR: { band: 6, signals_triggered: [], evidence: [] },
      GRA: { band: 6, signals_triggered: [], evidence: [] },
      lintopus_vi: 'ok',
    });
    const result = processWritingOutput(bad, sourceEssay);
    expect(result.ok).toBe(true);
    expect(result.data.TA.band).toBe(9);
    expect(result.warnings.some((w) => w.includes('clamped'))).toBe(true);
  });

  it('marks invalid evidence quotes', () => {
    const withFakeQuote = JSON.stringify({
      TA: {
        band: 7,
        signals_triggered: [],
        evidence: [{ quote: 'This text is not in the essay', issue: 'test' }],
      },
      CC: { band: 6, signals_triggered: [], evidence: [] },
      LR: { band: 6, signals_triggered: [], evidence: [] },
      GRA: { band: 6, signals_triggered: [], evidence: [] },
      lintopus_vi: 'ok',
    });
    const result = processWritingOutput(withFakeQuote, sourceEssay);
    expect(result.ok).toBe(true);
    expect(result.data.TA.evidence[0].invalid).toBe(true);
    expect(result.warnings.some((w) => w.includes('invalid_quotes'))).toBe(true);
  });

  it('handles markdown-fenced LLM output', () => {
    const wrapped = '```json\n' + validLlmOutput + '\n```';
    const result = processWritingOutput(wrapped, sourceEssay);
    expect(result.ok).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// processSpeakingOutput — end-to-end
// ════════════════════════════════════════════════════════════════

describe('processSpeakingOutput', () => {
  const validLlmOutput = JSON.stringify({
    FC: { band: 6.5, signals_triggered: ['speaks_at_length_effortlessly'], evidence: [] },
    LR: { band: 6, signals_triggered: ['word_choice_errors'], evidence: [] },
    GR: { band: 6, signals_triggered: ['article_errors'], evidence: [] },
    P: { band: 6.5, signals_triggered: ['word_stress_accurate'], evidence: [] },
    lintopus_vi: 'Phát âm tiến bộ, focus vào grammar.',
  });

  const transcript = 'Well, I think technology is really important in modern life.';

  it('returns ok=true for valid output', () => {
    const result = processSpeakingOutput(validLlmOutput, transcript);
    expect(result.ok).toBe(true);
  });

  it('recomputes overall band', () => {
    // avg = (6.5 + 6 + 6 + 6.5) / 4 = 6.25 → 6.5
    const result = processSpeakingOutput(validLlmOutput, transcript);
    expect(result.data.overall).toBe(6.5);
  });

  it('fails on missing criterion', () => {
    const partial = JSON.stringify({
      FC: { band: 6, signals_triggered: [], evidence: [] },
      LR: { band: 6, signals_triggered: [], evidence: [] },
      GR: { band: 6, signals_triggered: [], evidence: [] },
      // P missing
      lintopus_vi: 'ok',
    });
    const result = processSpeakingOutput(partial, transcript);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('missing_criterion_P');
  });
});
