"use client";

/**
 * NotePanel — slide-out scratchpad for the active reading passage.
 *
 * Desktop: anchored to the right edge of the screen (~320px wide).
 * Mobile (<768px): bottom sheet that slides up from below.
 *
 * State is owned by the parent so notes are keyed by passage_id and
 * survive within the session (e.g. switching sections in Full Test
 * preserves notes for each passage independently). No DB this round —
 * refresh wipes notes by design.
 *
 * Hard cap: 2000 chars to keep state from growing unbounded.
 */

import { ChangeEvent } from "react";

const MAX_CHARS = 2000;

interface Props {
  open: boolean;
  value: string;
  onChange: (next: string) => void;
  onClose: () => void;
  passageTitle?: string;
}

export default function NotePanel({ open, value, onChange, onClose, passageTitle }: Props) {
  if (!open) return null;

  const handleChange = (ev: ChangeEvent<HTMLTextAreaElement>) => {
    const next = ev.target.value.slice(0, MAX_CHARS);
    onChange(next);
  };

  const charCount = value.length;
  const nearLimit = charCount > MAX_CHARS * 0.9;

  return (
    <>
      {/* Mobile backdrop — desktop has no backdrop so questions stay clickable. */}
      <div
        className="md:hidden fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="fixed z-40 flex flex-col bottom-0 left-0 right-0 max-h-[60vh] md:left-auto md:top-[57px] md:bottom-[60px] md:right-0 md:max-h-none md:w-[320px] rounded-t-xl md:rounded-none shadow-2xl"
        style={{ background: "var(--color-bg-card)", borderLeft: "1px solid var(--color-border)", borderTop: "1px solid var(--color-border)" }}
        role="dialog"
        aria-label="Ghi chú cho passage"
      >
        <header className="flex items-center justify-between gap-3 px-3 py-2.5 shrink-0" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
              Ghi chú
            </div>
            {passageTitle && (
              <div className="text-xs truncate" style={{ color: "var(--color-text-secondary)" }}>{passageTitle}</div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: "var(--color-bg-secondary)", color: "var(--color-text-secondary)" }}
            aria-label="Đóng ghi chú"
          >
            ✕
          </button>
        </header>

        <textarea
          value={value}
          onChange={handleChange}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="Ghi chú tự do — keyword, reasoning, từ mới…"
          className="flex-1 resize-none w-full p-3 text-sm font-mono"
          style={{
            background: "var(--color-bg)",
            color: "var(--color-text)",
            border: "none",
            outline: "none",
            minHeight: "180px",
          }}
        />

        <div className="px-3 py-2 text-[11px] font-mono shrink-0" style={{ borderTop: "1px solid var(--color-border)", color: nearLimit ? "#F59E0B" : "var(--color-text-tertiary)" }}>
          {charCount} / {MAX_CHARS} ký tự
        </div>
      </aside>
    </>
  );
}
