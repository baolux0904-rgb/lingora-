/**
 * Word-count utility for IELTS completion questions.
 *
 * IELTS "NO MORE THAN N WORDS" convention: count whitespace-separated tokens.
 * Digits and hyphenated forms count as a single word. Matches the
 * backend/src/services/readingScoring.js countWords implementation so the
 * frontend pre-check and backend scoring agree.
 */

export function countWords(s: string | null | undefined): number {
  if (!s) return 0;
  return String(s).trim().split(/\s+/).filter(Boolean).length;
}

export function exceedsMaxWords(s: string, max: number): boolean {
  return countWords(s) > max;
}
