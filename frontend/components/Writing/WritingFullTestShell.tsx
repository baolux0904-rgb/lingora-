"use client";

/**
 * WritingFullTestShell — Sprint 5C.2b3 extraction from WritingTab.
 *
 * The "🎯 Full Test — 60 phút" entry-state launch panel.
 *
 * Sprint 5C.2b5a — restyled to Wave 6 cream canon (bg-cream-warm,
 * border-navy/10, text-navy / text-navy-light, shadow-sm) matching
 * the rest of the Writing/ folder shipped in Sprint 5C.1 series.
 * "Bắt đầu Full Test" button now uses bg-navy directly (was raw
 * #1B2B4B literal) — same color, canonical class. All 5 functional
 * var(--*) refs eliminated.
 *
 * Conditional render guard `!activePrompt && mode === "full_test"`
 * stays in WritingTab — this component only renders the panel
 * contents, not the visibility logic.
 */

interface WritingFullTestShellProps {
  /** Error string from startWritingFullTest call. Renders inline when present. */
  error: string | null;
  /** Loading flag while the start call is in flight. Disables the button. */
  loading: boolean;
  /** Triggered when the user clicks "Bắt đầu Full Test". */
  onStart: () => void;
}

export default function WritingFullTestShell({
  error,
  loading,
  onStart,
}: WritingFullTestShellProps) {
  return (
    <div className="rounded-xl p-6 flex flex-col items-center gap-4 text-center bg-cream-warm border border-navy/10 shadow-sm font-sans">
      <div className="text-3xl">🎯</div>
      <div>
        <p className="text-base font-semibold text-navy">
          Full Test — 60 phút, cả Task 1 và Task 2
        </p>
        <p className="text-sm mt-1 text-navy-light">
          Hệ thống tự chọn một đề Task 1 và một đề Task 2. Không pause, không cảnh báo thời gian.
        </p>
      </div>
      {error && (
        <div className="text-sm" style={{ color: "#EF4444" }}>{error}</div>
      )}
      <button
        type="button"
        onClick={onStart}
        disabled={loading}
        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-60 bg-navy hover:bg-navy-dark transition-colors"
      >
        {loading ? "Đang tải đề..." : "Bắt đầu Full Test"}
      </button>
    </div>
  );
}
