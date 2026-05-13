"use client";

/**
 * HighlightedEssay — render essay with click-to-reveal popovers on
 * sentence-level highlights. 2-tier color (amber / red); teal "strong"
 * tier reserved for a future backend annotation API.
 *
 * Popover:
 *   - Positioned above the clicked highlight, viewport-clamped via
 *     getBoundingClientRect on toggle.
 *   - Renders into a portal at z-index 60 so sidebar overflow/stacking
 *     contexts can't clip it.
 *   - Closes on Escape, outside click, or another highlight click.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { parseHighlights, type HighlightTier } from "./utils/parseHighlights";
import type { SentenceCorrection } from "@/lib/types";

interface HighlightedEssayProps {
  essayText: string;
  corrections: SentenceCorrection[] | undefined;
  wordCount: number;
}

interface PopoverState {
  comment: string;
  top: number;
  left: number;
}

const TIER_STYLE: Record<HighlightTier, { bg: string; color: string }> = {
  improve: {
    bg: "var(--color-amber-bg)",
    color: "var(--color-amber-text)",
  },
  error: {
    bg: "var(--color-red-bg)",
    color: "var(--color-red-text)",
  },
};

const TIER_LABEL: Record<HighlightTier, string> = {
  improve: "Cần cải thiện",
  error: "Lỗi",
};

export default function HighlightedEssay({
  essayText,
  corrections,
  wordCount,
}: HighlightedEssayProps) {
  const segments = parseHighlights(essayText, corrections);
  const hasAnyHighlight = segments.some((s) => s.kind === "highlight");

  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, comment: string) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const popWidth = 300;
      const popHeight = 140;
      const gap = 8;
      const inLowerHalf = rect.top > window.innerHeight / 2;
      const top = inLowerHalf
        ? Math.max(8, rect.top - popHeight - gap)
        : rect.bottom + gap;
      const desiredLeft = rect.left + rect.width / 2 - popWidth / 2;
      const left = Math.min(
        window.innerWidth - popWidth - 8,
        Math.max(8, desiredLeft),
      );
      setPopover({ comment, top, left });
    },
    [],
  );

  const popoverRef = useRef<HTMLDivElement>(null);

  // Outside-click + Escape close.
  useEffect(() => {
    if (!popover) return;
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target)) return;
      // Highlight spans handle their own onClick; we don't dismiss when
      // the click hits another span (the new span sets fresh popover).
      const isHighlight = (target as HTMLElement | null)?.closest?.(
        "[data-writing-highlight=\"true\"]",
      );
      if (isHighlight) return;
      setPopover(null);
    }
    function onKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") setPopover(null);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKeydown);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKeydown);
    };
  }, [popover]);

  return (
    <section className="my-8">
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <div
          className="text-[11px] uppercase tracking-[0.16em]"
          style={{ color: "rgba(0, 168, 150, 0.7)" }}
        >
          Bài của bạn{" "}
          <span style={{ color: "var(--color-text-tertiary)" }}>· {wordCount} từ</span>
        </div>
        {hasAnyHighlight && (
          <div className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
            Click vào ô màu để xem góp ý
          </div>
        )}
      </div>

      <div
        className="rounded-r-md p-6"
        style={{
          background: "rgba(229,220,198,0.04)",
          borderLeft: "2px solid rgba(0,168,150,0.3)",
        }}
      >
        <div
          className="text-[15px] leading-[1.95] whitespace-pre-wrap"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {segments.map((seg, i) => {
            if (seg.kind === "plain") return <span key={i}>{seg.text}</span>;
            const style = TIER_STYLE[seg.tier];
            return (
              <button
                key={i}
                type="button"
                data-writing-highlight="true"
                onClick={(e) => handleClick(e, seg.comment)}
                aria-label={`Góp ý ${TIER_LABEL[seg.tier]}: ${seg.comment}`}
                className="px-1.5 py-0.5 rounded-sm cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
                style={{ background: style.bg, color: style.color }}
              >
                {seg.text}
              </button>
            );
          })}
        </div>
      </div>

      {hasAnyHighlight && (
        <div
          className="flex gap-4 mt-4 flex-wrap text-[12px]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: "var(--color-amber-bg)" }}
              aria-hidden="true"
            />
            Cần cải thiện
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: "var(--color-red-bg)" }}
              aria-hidden="true"
            />
            Lỗi
          </span>
        </div>
      )}

      {popover &&
        mounted &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="Góp ý"
            className="fixed w-[300px] rounded-lg shadow-xl"
            style={{
              top: popover.top,
              left: popover.left,
              zIndex: 100,
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-2">
              <span
                className="text-[10px] uppercase tracking-[0.16em]"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Góp ý
              </span>
              <button
                type="button"
                onClick={() => setPopover(null)}
                aria-label="Đóng góp ý"
                className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-[var(--color-bg-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
            <p
              className="px-4 pb-4 text-[14px] leading-[1.6]"
              style={{ color: "var(--color-text)" }}
            >
              {popover.comment}
            </p>
          </div>,
          document.body,
        )}
    </section>
  );
}
