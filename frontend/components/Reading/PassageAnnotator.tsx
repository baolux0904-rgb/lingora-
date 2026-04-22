"use client";

/**
 * PassageAnnotator — wraps a passage container with a floating toolbar
 * that lets the learner highlight (4 colors), underline, strike-through,
 * or clear text selections. Annotations are pure DOM mutations on the
 * children container; no React state tracks them. Persistence is per-mount
 * only — refresh wipes annotations, by design (no DB this round).
 *
 * Limitation (deliberate): selections that cross block-level elements
 * (e.g. paragraph boundary) are silently ignored. surroundContents()
 * throws on multi-block ranges and the workaround (extractContents +
 * fragment splice) introduces text-node fragmentation that's hard to
 * unwind on Clear. Single-paragraph selection covers the IELTS exam-
 * strategy use case.
 *
 * Selection within line-number gutter spans is suppressed by the existing
 * user-select: none rule on those spans.
 *
 * Mounted by both ReadingScreen (Practice) and FullTestRunner (Full Test)
 * around their passage rendering; works the same in either mode.
 */

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

type AnnotationType =
  | "highlight-yellow"
  | "highlight-pink"
  | "highlight-green"
  | "highlight-blue"
  | "underline"
  | "strike";

const STYLE_MAP: Record<AnnotationType, Partial<CSSStyleDeclaration>> = {
  "highlight-yellow": { background: "rgba(250, 204, 21, 0.45)", borderRadius: "2px" },
  "highlight-pink":   { background: "rgba(244, 114, 182, 0.45)", borderRadius: "2px" },
  "highlight-green":  { background: "rgba(74, 222, 128, 0.45)",  borderRadius: "2px" },
  "highlight-blue":   { background: "rgba(96, 165, 250, 0.45)",  borderRadius: "2px" },
  "underline":        { textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "2px" },
  "strike":           { textDecoration: "line-through" },
};

const TOOLBAR_BUTTONS: Array<{ type: AnnotationType; label: string; swatch: string }> = [
  { type: "highlight-yellow", label: "Vàng",    swatch: "rgba(250, 204, 21, 0.7)" },
  { type: "highlight-pink",   label: "Hồng",    swatch: "rgba(244, 114, 182, 0.7)" },
  { type: "highlight-green",  label: "Lá",      swatch: "rgba(74, 222, 128, 0.7)" },
  { type: "highlight-blue",   label: "Xanh",    swatch: "rgba(96, 165, 250, 0.7)" },
];

interface ToolbarPos {
  top: number;
  left: number;
}

interface Props {
  children: ReactNode;
  /**
   * Bumped from the parent when the underlying passage changes (e.g. switching
   * sections in Full Test). Lets the annotator clear stale toolbar state.
   */
  passageKey?: string;
}

export default function PassageAnnotator({ children, passageKey }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [toolbarPos, setToolbarPos] = useState<ToolbarPos | null>(null);
  const [hasAnyAnnotation, setHasAnyAnnotation] = useState(false);
  const savedRangeRef = useRef<Range | null>(null);

  // Reset transient state when the passage swaps under us.
  useEffect(() => {
    setToolbarPos(null);
    savedRangeRef.current = null;
  }, [passageKey]);

  const refreshHasAny = useCallback(() => {
    if (!containerRef.current) return;
    setHasAnyAnnotation(containerRef.current.querySelectorAll("[data-annotation]").length > 0);
  }, []);

  // Track selection inside the container; surface the toolbar when the user
  // releases a non-empty selection, hide it otherwise.
  useEffect(() => {
    const onSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        setToolbarPos(null);
        savedRangeRef.current = null;
        return;
      }
      const range = sel.getRangeAt(0);
      const container = containerRef.current;
      if (!container || !container.contains(range.commonAncestorContainer)) {
        setToolbarPos(null);
        savedRangeRef.current = null;
        return;
      }
      const rect = range.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      // Position above the selection, clamped to the container's left edge.
      const top = rect.top - containerRect.top - 44;
      const left = Math.max(0, rect.left - containerRect.left + rect.width / 2 - 110);
      savedRangeRef.current = range.cloneRange();
      setToolbarPos({ top, left });
    };

    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, []);

  const apply = useCallback((type: AnnotationType) => {
    const range = savedRangeRef.current;
    if (!range || range.collapsed) return;
    try {
      const span = document.createElement("span");
      span.dataset.annotation = type;
      Object.assign(span.style, STYLE_MAP[type] as Record<string, string>);
      // surroundContents throws on multi-block ranges → silent no-op
      // (documented limitation).
      range.surroundContents(span);
      window.getSelection()?.removeAllRanges();
      setToolbarPos(null);
      savedRangeRef.current = null;
      refreshHasAny();
    } catch {
      // Cross-block selection. Leave selection alive so the user can
      // shorten and retry; do nothing.
    }
  }, [refreshHasAny]);

  // Strip annotations whose nodes intersect the saved range.
  const clearSelected = useCallback(() => {
    const container = containerRef.current;
    const range = savedRangeRef.current;
    if (!container || !range) return;
    const spans = Array.from(container.querySelectorAll<HTMLElement>("[data-annotation]"));
    let touched = 0;
    for (const span of spans) {
      if (range.intersectsNode(span)) {
        unwrap(span);
        touched += 1;
      }
    }
    if (touched > 0) {
      window.getSelection()?.removeAllRanges();
      setToolbarPos(null);
      savedRangeRef.current = null;
      refreshHasAny();
    }
  }, [refreshHasAny]);

  const clearAll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    container.querySelectorAll<HTMLElement>("[data-annotation]").forEach(unwrap);
    refreshHasAny();
  }, [refreshHasAny]);

  return (
    <div ref={containerRef} className="relative">
      {children}

      {toolbarPos && (
        <div
          className="absolute z-30 flex items-center gap-1 px-1.5 py-1 rounded-lg shadow-lg"
          style={{
            top: toolbarPos.top,
            left: toolbarPos.left,
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            // Prevent the toolbar from itself stealing the selection.
            userSelect: "none",
          }}
          // mousedown triggers selectionchange → would dismiss the toolbar.
          // preventDefault keeps the saved range alive.
          onMouseDown={(e) => e.preventDefault()}
          role="toolbar"
          aria-label="Đánh dấu đoạn văn"
        >
          {TOOLBAR_BUTTONS.map((b) => (
            <button
              key={b.type}
              type="button"
              onClick={() => apply(b.type)}
              title={b.label}
              aria-label={`Highlight ${b.label}`}
              className="w-6 h-6 rounded transition-transform hover:scale-110"
              style={{ background: b.swatch }}
            />
          ))}
          <div className="w-px self-stretch mx-0.5" style={{ background: "var(--color-border)" }} />
          <button
            type="button"
            onClick={() => apply("underline")}
            title="Gạch chân"
            aria-label="Underline"
            className="w-6 h-6 rounded text-xs font-bold flex items-center justify-center hover:bg-white/5"
            style={{ color: "var(--color-text)", textDecoration: "underline", textUnderlineOffset: "2px" }}
          >
            U
          </button>
          <button
            type="button"
            onClick={() => apply("strike")}
            title="Gạch ngang"
            aria-label="Strike-through"
            className="w-6 h-6 rounded text-xs font-bold flex items-center justify-center hover:bg-white/5"
            style={{ color: "var(--color-text)", textDecoration: "line-through" }}
          >
            S
          </button>
          <div className="w-px self-stretch mx-0.5" style={{ background: "var(--color-border)" }} />
          <button
            type="button"
            onClick={clearSelected}
            title="Xoá đánh dấu vùng chọn"
            aria-label="Clear selection"
            className="w-6 h-6 rounded text-xs flex items-center justify-center hover:bg-white/5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            ⨯
          </button>
        </div>
      )}

      {hasAnyAnnotation && (
        <button
          type="button"
          onClick={clearAll}
          className="absolute top-0 right-0 z-10 text-[11px] px-2 py-1 rounded-md"
          style={{ background: "var(--color-bg-secondary)", color: "var(--color-text-tertiary)", border: "1px solid var(--color-border)" }}
          aria-label="Xoá tất cả đánh dấu"
        >
          Xoá tất cả đánh dấu
        </button>
      )}
    </div>
  );
}

function unwrap(node: HTMLElement) {
  const parent = node.parentNode;
  if (!parent) return;
  while (node.firstChild) parent.insertBefore(node.firstChild, node);
  parent.removeChild(node);
  // Merge adjacent text nodes so subsequent ranges stay coherent.
  parent.normalize?.();
}
