"use client";

/**
 * WritingNotesModal — scratch-note popup for the Writing editor.
 * Plain textarea, character counter (max 2000), closable via X, Escape,
 * or backdrop click. Content is not graded and lives in parent state only
 * (no DB persistence in this rework round).
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

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-0 md:p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Ghi chú"
    >
      <div
        className="flex flex-col w-full h-full md:w-[600px] md:h-[400px] md:rounded-xl overflow-hidden"
        style={{
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 20px 48px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">📝</span>
            <div className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>
              Ghi chú
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--color-bg-secondary)" }}
            aria-label="Đóng ghi chú"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-text)" }}>
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
          className="flex-1 w-full px-4 py-3 text-sm leading-relaxed resize-none focus:outline-none"
          style={{
            background: "var(--color-bg)",
            color: "var(--color-text)",
            border: "none",
          }}
        />

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-2.5 shrink-0"
          style={{
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-bg-secondary)",
          }}
        >
          <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            Không tính vào bài chấm
          </span>
          <span
            className="text-xs font-mono"
            style={{
              color: charCount >= MAX_CHARS ? "#EF4444" : "var(--color-text-tertiary)",
            }}
          >
            {charCount} / {MAX_CHARS} ký tự
          </span>
        </div>
      </div>
    </div>
  );
}
