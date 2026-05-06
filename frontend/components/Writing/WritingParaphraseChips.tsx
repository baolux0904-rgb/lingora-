"use client";

/**
 * WritingParaphraseChips — clickable pills of words/phrases the user
 * overused or could swap for more varied academic alternatives.
 *
 * Each chip expands inline into an accordion card showing alternatives
 * as copy-able pills plus the AI's "when to use which" context note.
 * Only one chip is expanded at a time — tapping another collapses the
 * previous. Tapping the already-open chip closes it.
 *
 * Silently hides itself when suggestions is empty or missing so it
 * never leaves an empty header on the page.
 *
 * Wave 6 Sprint 5C.1e — restyled to cream canon (bg-cream-warm,
 * border-navy/10, text-navy, font-sans DM Sans). Open chip uses
 * teal canon accent (was off-brand purple #7E4EC1) so chip clusters
 * across Writing/ feel unified with WritingPromptSelector.
 */

import { useState } from "react";
import type { ParaphraseSuggestion } from "@/lib/types";

interface WritingParaphraseChipsProps {
  suggestions: ParaphraseSuggestion[] | undefined;
}

export default function WritingParaphraseChips({ suggestions }: WritingParaphraseChipsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const list = (suggestions ?? []).filter((s) => s?.phrase && Array.isArray(s.alternatives) && s.alternatives.length > 0);
  if (list.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-semibold uppercase tracking-widest text-navy-light/70 font-sans">
        Gợi ý từ / cụm từ thay thế
      </div>
      <div className="flex flex-wrap gap-2">
        {list.map((s, i) => {
          const open = openIndex === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              title={s.alternatives.slice(0, 3).join(" · ")}
              className={
                "text-sm px-3 py-1.5 rounded-full transition-all cursor-pointer font-sans border " +
                (open
                  ? "bg-teal/10 text-teal border-teal/35"
                  : "bg-cream-warm text-navy border-navy/10 hover:border-teal/30")
              }
            >
              {s.phrase}
            </button>
          );
        })}
      </div>

      {openIndex !== null && list[openIndex] && (
        <div className="rounded-xl p-4 flex flex-col gap-3 bg-cream-warm border border-navy/10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-navy font-sans">
              “{list[openIndex].phrase}”
            </div>
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              className="text-xs text-navy-light/70 hover:text-navy transition-colors font-sans"
              aria-label="Đóng"
            >
              Đóng
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {list[openIndex].alternatives.map((alt, j) => (
              <span
                key={j}
                className="text-sm px-2.5 py-1 rounded-full bg-teal/10 text-teal border border-teal/25 font-sans"
              >
                {alt}
              </span>
            ))}
          </div>

          {list[openIndex].context && (
            <p className="text-sm leading-relaxed text-navy-light font-sans">
              {list[openIndex].context}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
