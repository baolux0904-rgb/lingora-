/**
 * Compute speechMetrics from Whisper segment output.
 *
 * Produces the exact shape `speechAnalyzer.analyzeSpeechFlow` expects:
 *   { totalDurationMs, wordsPerMinute, pauseCount, longestPauseMs,
 *     segmentCount, speakingRatio }
 *
 * Previously the frontend measured these via `useSpeechTiming` while the
 * browser was recording. We now derive them on the backend from Whisper's
 * verbose-json segments, so Safari / Firefox / mobile get the same signal
 * quality as Chrome + Edge.
 *
 * This module is pure — no DB, no network. Safe to import from services.
 *
 * @module domain/ielts/speechMetrics
 */

"use strict";

const PAUSE_THRESHOLD_S = 0.5; // gap > this between segments counts as a pause

/**
 * Count words in a transcript, ignoring empty strings.
 * @param {string} transcript
 */
function countWords(transcript) {
  if (!transcript || typeof transcript !== "string") return 0;
  return transcript.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Derive speechMetrics from Whisper segments + total audio duration.
 *
 * @param {Array<{start:number,end:number,text:string}>} segments
 * @param {number} durationSeconds                total audio length (Whisper-reported)
 * @returns {{
 *   totalDurationMs: number,
 *   wordsPerMinute: number,
 *   pauseCount: number,
 *   longestPauseMs: number,
 *   segmentCount: number,
 *   speakingRatio: number,
 * }}
 */
function computeSpeechMetricsFromSegments(segments, durationSeconds) {
  const safeDuration = Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : 0;
  const totalDurationMs = Math.round(safeDuration * 1000);
  const safeSegments = Array.isArray(segments) ? segments : [];
  const segmentCount = safeSegments.length;

  // Degenerate: no segments (empty audio, Whisper returned nothing).
  if (segmentCount === 0) {
    return {
      totalDurationMs,
      wordsPerMinute: 0,
      pauseCount: 0,
      longestPauseMs: 0,
      segmentCount: 0,
      speakingRatio: 0,
    };
  }

  // Words per minute — derived from concatenated segment text + audio duration.
  // Audio duration is the right denominator (not sum of segment durations),
  // matching what the frontend used to compute (words over wall-clock time).
  const totalWords = safeSegments.reduce((sum, s) => sum + countWords(s.text), 0);
  const wordsPerMinute = safeDuration > 0
    ? Math.round((totalWords / safeDuration) * 60)
    : 0;

  // Pause analysis — gaps between consecutive segment ends / starts.
  let pauseCount = 0;
  let longestPauseSeconds = 0;
  for (let i = 1; i < safeSegments.length; i++) {
    const prevEnd = safeSegments[i - 1].end;
    const currStart = safeSegments[i].start;
    const gap = currStart - prevEnd;
    if (gap > PAUSE_THRESHOLD_S) {
      pauseCount += 1;
      if (gap > longestPauseSeconds) longestPauseSeconds = gap;
    }
  }
  const longestPauseMs = Math.round(longestPauseSeconds * 1000);

  // Speaking ratio — total segment duration over total audio duration.
  const totalSpeakingSeconds = safeSegments.reduce(
    (sum, s) => sum + Math.max(0, s.end - s.start),
    0,
  );
  const speakingRatio = safeDuration > 0
    ? Math.min(1, Math.round((totalSpeakingSeconds / safeDuration) * 100) / 100)
    : 0;

  return {
    totalDurationMs,
    wordsPerMinute,
    pauseCount,
    longestPauseMs,
    segmentCount,
    speakingRatio,
  };
}

module.exports = {
  computeSpeechMetricsFromSegments,
  PAUSE_THRESHOLD_S,
};
