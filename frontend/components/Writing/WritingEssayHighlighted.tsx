"use client";

/**
 * WritingEssayHighlighted — renders the student's essay with every
 * sentence that appears in `corrections` wrapped in a color-coded
 * wavy-underline span. Clicking a flagged sentence calls
 * `onCorrectionClick` so the parent can open a sidebar drawer with
 * the full correction detail.
 *
 * Sentence detection is punctuation-based (. ! ?). To match AI output
 * to essay text we compare normalized forms (collapsed whitespace +
 * lowercase); minor whitespace or case drift in the AI reply still maps
 * onto the correct essay sentence.
 *
 * When a single sentence carries multiple corrections of different
 * error types, the "most severe" type wins for the underline color:
 * grammar > coherence > vocabulary. All matching corrections stay
 * addressable via the data attribute so the drawer can show them all.
 */

import { useMemo } from "react";
import type { SentenceCorrection, WritingErrorType } from "@/lib/types";

interface WritingEssayHighlightedProps {
  essayText: string;
  corrections: SentenceCorrection[];
  onCorrectionClick: (sentenceNormalized: string) => void;
}

const SEVERITY: Record<WritingErrorType, number> = {
  grammar: 3,
  coherence: 2,
  vocabulary: 1,
};

function errorTypeColor(type: WritingErrorType | undefined) {
  switch (type) {
    case "grammar":     return "#1B2B4B"; // navy
    case "vocabulary":  return "#00A896"; // teal
    case "coherence":   return "#F07167"; // coral
    default:            return "var(--color-text-secondary)";
  }
}

function errorTypeLabel(type: WritingErrorType | undefined): string {
  switch (type) {
    case "grammar":     return "Ngữ pháp";
    case "vocabulary":  return "Từ vựng";
    case "coherence":   return "Liên kết";
    default:            return "Lỗi";
  }
}

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Split the essay into segments: each segment is either a full sentence
 * (ending in . ! ? optionally followed by a closing quote/bracket) OR a
 * trailing fragment with no terminator. Whitespace between sentences is
 * preserved inside the following segment.
 */
function splitSentences(text: string): string[] {
  if (!text) return [];
  // Match runs that end at a sentence terminator, including the trailing
  // whitespace before the next sentence. Handles ... ? ! " ' ) ] as well.
  const re = /[^.!?]+[.!?]+[\s"'\)\]]*|[^.!?]+$/g;
  const out = text.match(re);
  return out ?? [text];
}

export default function WritingEssayHighlighted({
  essayText,
  corrections,
  onCorrectionClick,
}: WritingEssayHighlightedProps) {
  // Build a lookup: normalized sentence → worst error_type + correction count.
  const lookup = useMemo(() => {
    const map = new Map<string, { type: WritingErrorType | undefined; count: number }>();
    for (const c of corrections ?? []) {
      if (!c?.original) continue;
      const key = normalize(c.original);
      const existing = map.get(key);
      const severity = c.error_type ? SEVERITY[c.error_type] ?? 0 : 0;
      const existingSeverity = existing?.type ? SEVERITY[existing.type] ?? 0 : 0;
      if (!existing || severity > existingSeverity) {
        map.set(key, { type: c.error_type, count: (existing?.count ?? 0) + 1 });
      } else {
        map.set(key, { type: existing.type, count: existing.count + 1 });
      }
    }
    return map;
  }, [corrections]);

  const segments = useMemo(() => splitSentences(essayText), [essayText]);

  return (
    <div
      className="rounded-xl p-5 text-sm leading-[1.9] whitespace-pre-wrap"
      style={{
        background: "var(--surface-primary)",
        border: "1px solid var(--surface-border)",
        color: "var(--color-text)",
        boxShadow: "var(--surface-shadow)",
      }}
    >
      {segments.map((seg, i) => {
        const key = normalize(seg);
        const hit = lookup.get(key);
        if (!hit) {
          return <span key={i}>{seg}</span>;
        }
        const color = errorTypeColor(hit.type);
        return (
          <span
            key={i}
            role="button"
            tabIndex={0}
            aria-label={`${errorTypeLabel(hit.type)} — bấm để xem chi tiết`}
            onClick={() => onCorrectionClick(key)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCorrectionClick(key);
              }
            }}
            className="cursor-pointer transition-colors"
            style={{
              textDecorationLine: "underline",
              textDecorationStyle: "wavy",
              textDecorationColor: color,
              textUnderlineOffset: "3px",
              textDecorationThickness: "2px",
            }}
          >
            {seg}
          </span>
        );
      })}
    </div>
  );
}
