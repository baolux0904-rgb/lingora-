"use client";

/**
 * MatchingHeadingsQuestion — Dropdown per paragraph (per Louis decision B,
 * not drag-drop). The IELTS computer-delivered interface uses a dropdown on
 * each paragraph; we follow that.
 *
 * Answer format: JSON.stringify({ [paragraphLabel]: headingLetter, ... }).
 */

import { useMemo } from "react";

interface Heading {
  letter: string;
  text: string;
}

interface Paragraph {
  label: string;
}

interface Payload {
  headings: Heading[];
  paragraphs: Paragraph[];
  // correct_mapping is present in the payload but not used by the UI.
}

interface MatchingHeadingsQuestionProps {
  options: unknown;
  answer: string; // JSON-stringified object of { label: letter }
  onAnswer: (a: string) => void;
}

function parseMapping(answer: string): Record<string, string> {
  try {
    const v = JSON.parse(answer);
    return v && typeof v === "object" ? (v as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export default function MatchingHeadingsQuestion({ options, answer, onAnswer }: MatchingHeadingsQuestionProps) {
  const payload = options as Payload | null;
  const headings = payload?.headings ?? [];
  const paragraphs = payload?.paragraphs ?? [];
  const mapping = useMemo(() => parseMapping(answer), [answer]);

  if (!headings.length || !paragraphs.length) return null;

  const update = (label: string, letter: string) => {
    const next = { ...mapping };
    if (letter) next[label] = letter;
    else delete next[label];
    onAnswer(JSON.stringify(next));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg p-3" style={{ background: "var(--color-bg-secondary)", border: "1px solid var(--color-border)" }}>
        <div className="text-xs font-semibold mb-2 uppercase" style={{ color: "var(--color-text-tertiary)" }}>Headings</div>
        <ol className="space-y-1 text-sm" style={{ color: "var(--color-text)" }}>
          {headings.map((h) => (
            <li key={h.letter}>
              <span className="font-semibold mr-2" style={{ color: "#00A896" }}>{h.letter}.</span>
              {h.text}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-2">
        {paragraphs.map((p) => {
          const selected = mapping[p.label] ?? "";
          return (
            <div key={p.label} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0"
                style={{ background: "rgba(0,168,150,0.12)", color: "#00A896" }}
              >
                {p.label}
              </div>
              <select
                value={selected}
                onChange={(e) => update(p.label, e.target.value)}
                className="flex-1 rounded-lg px-3 py-2 text-sm"
                style={{
                  background: "var(--color-bg-secondary)",
                  border: `1px solid ${selected ? "rgba(0,168,150,0.4)" : "var(--color-border)"}`,
                  color: "var(--color-text)",
                }}
                aria-label={`Chọn heading cho đoạn ${p.label}`}
              >
                <option value="">— Chọn heading —</option>
                {headings.map((h) => (
                  <option key={h.letter} value={h.letter}>{h.letter}. {h.text}</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
