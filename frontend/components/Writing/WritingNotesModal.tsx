"use client";

/**
 * WritingNotesModal — scratch-note popup for the Writing editor.
 * Plain textarea, character counter (max 2000), closable via X, Escape,
 * or backdrop click. Content is not graded and lives in parent state only
 * (no DB persistence in this rework round).
 *
 * Wave 6 Sprint 5C.1f — restyled to cream canon, closing out Sprint
 * 5C.1 Practice file series. Backdrop bg-navy/50 (slightly heavier
 * than 5C.1e timer to keep modal scrim distinct from inline bars),
 * panel bg-cream-warm with border-navy/10. Header + footer bg-cream-soft
 * for nested surface contrast. Modal lifecycle (escape/backdrop/
 * autofocus) preserved untouched.
 */

import { useEffect, useRef } from "react";

const MAX_CHARS = 2000;

interface WritingNotesModalProps {
  open: boolean;
  value: string;
  onChange: (next: string) => void;
  onClose: () => void;
}

export default function WritingNotesModal({ open, value, onChange, onClose }: WritingNotesModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Autofocus textarea on open
    const t = setTimeout(() => textareaRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  const charCount = value.length;
  const atLimit = charCount >= MAX_CHARS;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-0 md:p-4 bg-navy/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Ghi chú"
    >
      <div
        className="flex flex-col w-full h-full md:w-[600px] md:h-[400px] md:rounded-xl overflow-hidden bg-cream-warm border border-navy/10 shadow-xl font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-navy/10 bg-cream-soft">
          <div className="flex items-center gap-2">
            <span className="text-base">📝</span>
            <div className="font-semibold text-sm text-navy">
              Ghi chú
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-cream-warm border border-navy/10 hover:border-teal/30 transition-colors"
            aria-label="Đóng ghi chú"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-navy">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Outline ý chính, brainstorm từ vựng, hoặc note bất kỳ điều gì — không chấm điểm..."
          className="flex-1 w-full px-4 py-3 text-sm leading-relaxed resize-none focus:outline-none bg-cream text-navy border-none placeholder:text-navy-light/50"
        />

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 shrink-0 border-t border-navy/10 bg-cream-soft">
          <span className="text-xs text-navy-light/70">
            Không tính vào bài chấm
          </span>
          <span
            className={
              "text-xs font-mono " +
              (atLimit ? "" : "text-navy-light/70")
            }
            style={atLimit ? { color: "#EF4444" } : undefined}
          >
            {charCount} / {MAX_CHARS} ký tự
          </span>
        </div>
      </div>
    </div>
  );
}
