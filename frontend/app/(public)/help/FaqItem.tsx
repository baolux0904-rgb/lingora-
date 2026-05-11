"use client";

import { useState, useId } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItemProps {
  id: string;
  question: string;
  answer: string;
}

/**
 * Renders the answer body. Supports:
 *   - blank-line paragraph breaks
 *   - lines starting with "1.", "2." → <ol>
 *   - inline markdown links [text](href) → <a>
 *
 * Kept inline (no markdown lib) — small scope, single use.
 */
function renderAnswer(answer: string) {
  const blocks = answer.split(/\n\n+/);
  return blocks.map((block, bi) => {
    const lines = block.split("\n");
    const isOrdered = lines.every((l) => /^\d+\.\s+/.test(l.trim()));
    if (isOrdered && lines.length > 1) {
      return (
        <ol key={bi} className="list-decimal list-outside ml-5 space-y-1.5 mt-3">
          {lines.map((l, i) => (
            <li key={i}>{renderInline(l.replace(/^\d+\.\s+/, ""))}</li>
          ))}
        </ol>
      );
    }
    return (
      <p key={bi} className={bi === 0 ? "" : "mt-3"}>
        {renderInline(block)}
      </p>
    );
  });
}

function renderInline(text: string) {
  const parts: Array<string | { href: string; text: string }> = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push({ text: m[1], href: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));

  return parts.map((p, i) =>
    typeof p === "string" ? (
      <span key={i}>{p}</span>
    ) : (
      <a
        key={i}
        href={p.href}
        className="text-teal underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded"
      >
        {p.text}
      </a>
    )
  );
}

export default function FaqItem({ id, question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  const uid = useId();
  const buttonId = `faq-button-${id}-${uid}`;
  const panelId = `faq-panel-${id}-${uid}`;

  return (
    <div className="rounded-lg border border-navy/10 bg-cream-warm hover:border-navy/20 transition-colors duration-150">
      <h3 className="m-0">
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-start justify-between gap-4 text-left px-5 py-4 lg:py-5 font-sans font-medium text-[16px] lg:text-[17px] leading-snug text-navy hover:text-teal transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-lg"
        >
          <span className="flex-1">{question}</span>
          <ChevronDown
            aria-hidden="true"
            className={`w-5 h-5 mt-0.5 text-navy/60 shrink-0 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-1 font-sans text-[15px] lg:text-[16px] leading-[1.65] text-navy/80">
            {renderAnswer(answer)}
          </div>
        </div>
      </div>
    </div>
  );
}
