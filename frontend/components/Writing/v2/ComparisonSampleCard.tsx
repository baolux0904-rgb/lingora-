"use client";

/**
 * ComparisonSampleCard — inline expand card showing the AI-generated
 * Band 7 sample essay. Source: feedback_json.sample_essay. Renders
 * nothing when the field is null.
 */

import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

interface ComparisonSampleCardProps {
  sampleEssay: string | null | undefined;
  currentBand: number | null;
}

export default function ComparisonSampleCard({
  sampleEssay,
  currentBand,
}: ComparisonSampleCardProps) {
  const [open, setOpen] = useState(false);
  if (!sampleEssay || sampleEssay.trim().length === 0) return null;

  return (
    <section className="my-8">
      <div
        className="text-[11px] uppercase tracking-[0.16em] mb-3"
        style={{ color: "rgba(0, 168, 150, 0.7)" }}
      >
        So với band 7 mẫu
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left rounded-md p-5 transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 group"
        style={{
          background: "rgba(0, 168, 150, 0.06)",
          border: "1px solid rgba(0, 168, 150, 0.2)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div
              className="font-display italic text-[16px] leading-tight"
              style={{ color: "var(--color-text)" }}
            >
              {open ? "Đóng bài mẫu" : "Xem bài mẫu band 7 cùng đề"}
            </div>
            <div
              className="text-[12px] mt-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {currentBand !== null
                ? `So sánh để hiểu khoảng cách band ${currentBand.toFixed(1)} → 7.0`
                : "So sánh để hiểu cách viết band 7"}
            </div>
          </div>
          {open ? (
            <ChevronDown
              className="w-5 h-5 shrink-0 transition-transform duration-fast"
              strokeWidth={2}
              style={{ color: "rgba(0, 168, 150, 0.7)" }}
              aria-hidden="true"
            />
          ) : (
            <ArrowRight
              className="w-5 h-5 shrink-0 transition-transform duration-fast group-hover:translate-x-0.5"
              strokeWidth={2}
              style={{ color: "rgba(0, 168, 150, 0.7)" }}
              aria-hidden="true"
            />
          )}
        </div>
      </button>

      {open && (
        <div
          className="mt-3 p-5 rounded-md"
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            className="text-[10px] uppercase tracking-[0.16em] mb-3"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Bài mẫu band 7
          </div>
          <p
            className="text-[15px] leading-[1.85] whitespace-pre-wrap"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {sampleEssay}
          </p>
        </div>
      )}
    </section>
  );
}
