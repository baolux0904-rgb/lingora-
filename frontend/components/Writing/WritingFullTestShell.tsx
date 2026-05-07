"use client";

/**
 * WritingFullTestShell — Sprint 5C.2b3 extraction from WritingTab.
 *
 * The "🎯 Full Test — 60 phút" entry-state launch panel that used to
 * live inline at WritingTab.tsx lines 611-638 (pre-extraction).
 * Faithful 1:1 visual + behavioral copy — Sprint 5C.2b1 zero-tolerance
 * regression rule applies. The pre-Wave-6 var(--color-*) +
 * var(--surface-*) tokens are preserved here so the launch panel
 * renders IDENTICALLY post-extraction. Cream-canon restyle of these
 * tokens is 5C.2b5's stated scope.
 *
 * Conditional render guard `!activePrompt && mode === "full_test"`
 * stays in WritingTab — this component only renders the panel
 * contents, not the visibility logic.
 *
 * Sprint 5C.2b2 was retroactively skipped (Practice render path has
 * no clean atomic seam beyond what Sprint 5C.1 already extracted).
 * See 5C.2b3 commit body for audit finding.
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
    <div
      className="rounded-xl p-6 flex flex-col items-center gap-4 text-center"
      style={{ background: "var(--surface-primary)", border: "1px solid var(--surface-border)", boxShadow: "var(--surface-shadow)" }}
    >
      <div className="text-3xl">🎯</div>
      <div>
        <p className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
          Full Test — 60 phút, cả Task 1 và Task 2
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
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
        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-60"
        style={{ background: "#1B2B4B" }}
      >
        {loading ? "Đang tải đề..." : "Bắt đầu Full Test"}
      </button>
    </div>
  );
}
