"use client";

/**
 * SentenceCompletionQuestion — text inputs for each sentence blank.
 *
 * Per-blank "NO MORE THAN N WORDS" instruction above the input. Live word
 * counter below, red when over-limit. We don't block typing past max — the
 * user sees the counter go red and can self-correct. Backend also enforces,
 * so an over-limit submission simply scores 0 for that blank with a
 * "exceeds_max_words" reason.
 *
 * Answer format: JSON.stringify({ [sentenceId]: text, ... }).
 */

import { useMemo } from "react";
import { countWords } from "@/lib/wordCount";

interface Sentence {
  id: string;
  text_with_blank: string;
  max_words: number;
  // correct_answers not used in the UI
}

interface Payload {
  sentences: Sentence[];
}

interface Props {
  options: unknown;
  answer: string;
  onAnswer: (a: string) => void;
}

function parseAnswer(answer: string): Record<string, string> {
  try {
    const v = JSON.parse(answer);
    return v && typeof v === "object" ? (v as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export default function SentenceCompletionQuestion({ options, answer, onAnswer }: Props) {
  const payload = options as Payload | null;
  const sentences = payload?.sentences ?? [];
  const values = useMemo(() => parseAnswer(answer), [answer]);

  if (!sentences.length) return null;

  const update = (id: string, text: string) => {
    const next = { ...values, [id]: text };
    if (!text) delete next[id];
    onAnswer(JSON.stringify(next));
  };

  return (
    <div className="flex flex-col gap-4">
      {sentences.map((s) => {
        const v = values[s.id] ?? "";
        const count = countWords(v);
        const overLimit = count > s.max_words;
        return (
          <div key={s.id} className="flex flex-col gap-1.5">
            <div className="text-[10px] font-bold tracking-wider uppercase" style={{ color: "var(--color-text-tertiary)" }}>
              No more than {s.max_words} {s.max_words === 1 ? "word" : "words"}
            </div>
            <p className="text-sm" style={{ color: "var(--color-text)", fontFamily: 'Georgia, "Times New Roman", serif' }}>
              {s.text_with_blank}
            </p>
            <input
              type="text"
              value={v}
              onChange={(e) => update(s.id, e.target.value)}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              className="rounded-lg px-3 py-2 text-sm"
              style={{
                background: "var(--color-bg-secondary)",
                border: `1px solid ${overLimit ? "#EF4444" : v ? "rgba(0,168,150,0.4)" : "var(--color-border)"}`,
                color: "var(--color-text)",
              }}
              aria-invalid={overLimit}
            />
            <div className="text-[11px] font-mono" style={{ color: overLimit ? "#EF4444" : "var(--color-text-tertiary)" }}>
              {count}/{s.max_words} words
            </div>
          </div>
        );
      })}
    </div>
  );
}
