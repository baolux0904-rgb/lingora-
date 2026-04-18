/**
 * Unit tests for computeSpeechMetricsFromSegments.
 *
 * Pin the shape + edge cases so future Whisper API changes can't silently
 * drift the values speechAnalyzer downstream sees.
 */

const { computeSpeechMetricsFromSegments } = require('../../../src/domain/ielts/speechMetrics');

describe('computeSpeechMetricsFromSegments', () => {
  it('returns the speechAnalyzer-compatible shape', () => {
    const metrics = computeSpeechMetricsFromSegments([], 0);
    expect(Object.keys(metrics).sort()).toEqual([
      'longestPauseMs',
      'pauseCount',
      'segmentCount',
      'speakingRatio',
      'totalDurationMs',
      'wordsPerMinute',
    ]);
  });

  it('handles empty segments / zero duration gracefully', () => {
    expect(computeSpeechMetricsFromSegments([], 0)).toEqual({
      totalDurationMs: 0,
      wordsPerMinute: 0,
      pauseCount: 0,
      longestPauseMs: 0,
      segmentCount: 0,
      speakingRatio: 0,
    });
  });

  it('computes WPM from concatenated segment text over audio duration', () => {
    // 20 words over 10 seconds → 120 WPM
    const segments = [
      { start: 0, end: 5, text: 'one two three four five six seven eight nine ten' },
      { start: 5, end: 10, text: 'eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty' },
    ];
    const m = computeSpeechMetricsFromSegments(segments, 10);
    expect(m.wordsPerMinute).toBe(120);
  });

  it('counts pauses only for gaps > PAUSE_THRESHOLD_S', () => {
    // Gaps of 0.3s (no pause) and 0.8s (pause)
    const segments = [
      { start: 0, end: 2, text: 'first segment' },
      { start: 2.3, end: 4, text: 'second segment' },      // gap 0.3s — below threshold
      { start: 4.8, end: 6, text: 'third segment' },       // gap 0.8s — pause
    ];
    const m = computeSpeechMetricsFromSegments(segments, 6);
    expect(m.pauseCount).toBe(1);
    expect(m.longestPauseMs).toBe(800);
    expect(m.segmentCount).toBe(3);
  });

  it('tracks the longest pause when multiple pauses exist', () => {
    const segments = [
      { start: 0, end: 1, text: 'a' },
      { start: 2.0, end: 3, text: 'b' },   // 1.0s pause
      { start: 5.5, end: 6, text: 'c' },   // 2.5s pause — largest
      { start: 7.2, end: 8, text: 'd' },   // 1.2s pause
    ];
    const m = computeSpeechMetricsFromSegments(segments, 8);
    expect(m.pauseCount).toBe(3);
    expect(m.longestPauseMs).toBe(2500);
  });

  it('computes speakingRatio as total speech time / audio duration, capped at 1', () => {
    // 3s speech within a 10s clip → 0.3
    const segments = [
      { start: 0, end: 1, text: 'hi' },
      { start: 5, end: 7, text: 'there' },
    ];
    const m = computeSpeechMetricsFromSegments(segments, 10);
    expect(m.speakingRatio).toBe(0.3);
  });

  it('clamps speakingRatio at 1 when segments overlap / drift past duration', () => {
    // Deliberately malformed: 4s of speech in a 3s clip.
    const segments = [
      { start: 0, end: 4, text: 'overflow segment' },
    ];
    const m = computeSpeechMetricsFromSegments(segments, 3);
    expect(m.speakingRatio).toBeLessThanOrEqual(1);
  });

  it('converts duration to ms and stores segment count', () => {
    const segments = [{ start: 0, end: 1.234, text: 'hello' }];
    const m = computeSpeechMetricsFromSegments(segments, 1.234);
    expect(m.totalDurationMs).toBe(1234);
    expect(m.segmentCount).toBe(1);
  });

  it('ignores invalid input (null segments, NaN duration) without throwing', () => {
    expect(() => computeSpeechMetricsFromSegments(null, NaN)).not.toThrow();
    const m = computeSpeechMetricsFromSegments(null, NaN);
    expect(m.totalDurationMs).toBe(0);
    expect(m.segmentCount).toBe(0);
  });
});
