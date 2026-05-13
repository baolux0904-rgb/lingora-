/**
 * parseHighlights — map AI sentence_corrections onto essay_text positions.
 *
 * Backend ships SentenceCorrection[] with `original` sentence text and
 * `error_type` ('grammar' | 'vocabulary' | 'coherence'). There is no
 * positional index — we must locate each correction in the essay by
 * substring search.
 *
 * Strategy (ported from legacy WritingEssayHighlighted):
 *   1. Split essay_text into sentences via punctuation (. ! ?).
 *   2. Normalize each (collapse whitespace + lowercase) so minor drift
 *      between AI output and student essay still matches.
 *   3. Walk corrections; for each, find the first essay sentence whose
 *      normalized form matches the correction's normalized `original`.
 *   4. Output an ordered HighlightSegment[] suitable for direct render:
 *      either {kind: "plain", text} or {kind: "highlight", text, tier, comment}.
 *
 * Tier mapping (Session 1.5 — 2-tier v1, teal "strong" tier reserved):
 *   - error_type "grammar"   → "error"   (red)
 *   - error_type "vocabulary"|"coherence"|undefined → "improve" (amber)
 *
 * Edge cases:
 *   - Empty corrections array → returns single plain segment with whole essay.
 *   - Correction whose `original` matches no sentence → silently skipped.
 *   - Multiple corrections matching same sentence → most severe wins
 *     (grammar > coherence/vocabulary). Other comments aggregated into
 *     the segment's `comment` (joined with " · ").
 */

import type { SentenceCorrection, WritingErrorType } from "@/lib/types";

export type HighlightTier = "improve" | "error";

export type HighlightSegment =
  | { kind: "plain"; text: string }
  | { kind: "highlight"; text: string; tier: HighlightTier; comment: string };

function normalize(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

function splitSentences(essay: string): { raw: string; norm: string }[] {
  // Split keeping the terminating punctuation with the preceding sentence.
  const out: { raw: string; norm: string }[] = [];
  const parts = essay.split(/([.!?]+)/);
  let buf = "";
  for (const p of parts) {
    buf += p;
    if (/[.!?]+$/.test(p)) {
      out.push({ raw: buf, norm: normalize(buf) });
      buf = "";
    }
  }
  if (buf.length > 0) out.push({ raw: buf, norm: normalize(buf) });
  return out;
}

function tierFor(err: WritingErrorType | undefined): HighlightTier {
  if (err === "grammar") return "error";
  return "improve";
}

const SEVERITY: Record<HighlightTier, number> = {
  error: 2,
  improve: 1,
};

export function parseHighlights(
  essayText: string,
  corrections: SentenceCorrection[] | undefined,
): HighlightSegment[] {
  if (!essayText) return [];
  if (!corrections || corrections.length === 0) {
    return [{ kind: "plain", text: essayText }];
  }

  const sentences = splitSentences(essayText);
  // Annotation map: index in `sentences` → { tier, comments[] }
  const annotated = new Map<number, { tier: HighlightTier; comments: string[] }>();

  for (const c of corrections) {
    if (!c.original) continue;
    const targetNorm = normalize(c.original);
    if (!targetNorm) continue;
    const idx = sentences.findIndex((s) => s.norm === targetNorm);
    if (idx === -1) continue;
    const tier = tierFor(c.error_type);
    const existing = annotated.get(idx);
    if (!existing) {
      annotated.set(idx, { tier, comments: [c.explanation || ""].filter(Boolean) });
    } else {
      if (SEVERITY[tier] > SEVERITY[existing.tier]) existing.tier = tier;
      if (c.explanation) existing.comments.push(c.explanation);
    }
  }

  if (annotated.size === 0) {
    return [{ kind: "plain", text: essayText }];
  }

  return sentences.map((s, i) => {
    const ann = annotated.get(i);
    if (!ann) return { kind: "plain", text: s.raw };
    return {
      kind: "highlight",
      text: s.raw,
      tier: ann.tier,
      comment: ann.comments.join(" · "),
    };
  });
}
