"use client";

/**
 * AIFeedbackProse — 3 structured editorial sections.
 *
 * Source: WritingFeedback.{strengths, weaknesses, improvements / top_3_priorities}.
 * Each section: eyebrow caps + arrow-prefixed items.
 * Sections with empty arrays are skipped (no empty state).
 *
 * "Gợi ý cụ thể" prefers top_3_priorities (shorter, more focused);
 * falls back to improvements if priorities are absent.
 */

import { ArrowRight } from "lucide-react";

interface AIFeedbackProseProps {
  strengths?: string[] | null;
  weaknesses?: string[] | null;
  improvements?: string[] | null;
  topPriorities?: string[] | null;
}

interface Section {
  eyebrow: string;
  items: string[];
}

function buildSections({
  strengths,
  weaknesses,
  improvements,
  topPriorities,
}: AIFeedbackProseProps): Section[] {
  const sections: Section[] = [];
  if (strengths && strengths.length > 0) {
    sections.push({ eyebrow: "Bạn làm tốt", items: strengths });
  }
  if (weaknesses && weaknesses.length > 0) {
    sections.push({ eyebrow: "Cần làm khác", items: weaknesses });
  }
  const priorityItems =
    topPriorities && topPriorities.length > 0
      ? topPriorities
      : improvements && improvements.length > 0
        ? improvements
        : [];
  if (priorityItems.length > 0) {
    sections.push({ eyebrow: "Gợi ý cụ thể", items: priorityItems });
  }
  return sections;
}

export default function AIFeedbackProse(props: AIFeedbackProseProps) {
  const sections = buildSections(props);
  if (sections.length === 0) return null;

  return (
    <section className="my-8">
      <div
        className="text-[11px] uppercase tracking-[0.16em] mb-4"
        style={{ color: "rgba(0, 168, 150, 0.7)" }}
      >
        Lingona nhận xét
      </div>
      <div className="flex flex-col gap-7 max-w-[640px]">
        {sections.map((s, idx) => (
          <div key={s.eyebrow}>
            {idx > 0 && (
              <div
                className="border-t mb-7"
                style={{ borderColor: "rgba(229,220,198,0.16)" }}
                aria-hidden="true"
              />
            )}
            <div
              className="text-[10px] uppercase tracking-[0.16em] mb-3"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {s.eyebrow}
            </div>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {s.items.map((item, i) => (
                <li
                  key={`${s.eyebrow}-${i}`}
                  className="flex items-start gap-3 text-[15px] leading-[1.65]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <ArrowRight
                    className="w-4 h-4 mt-1 shrink-0"
                    strokeWidth={2}
                    style={{ color: "rgba(0, 168, 150, 0.7)" }}
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
