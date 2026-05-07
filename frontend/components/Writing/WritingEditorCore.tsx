"use client";

/**
 * WritingEditorCore — Sprint 5C.2b1 extraction from WritingTab monolith.
 *
 * Purely the controlled textarea + word-count progress bar that used
 * to live inline at WritingTab.tsx lines 749-790 (pre-extraction).
 * Faithful 1:1 visual + behavioral copy — Sprint 5C.2b1 zero-tolerance
 * regression rule trumps Phase 2.4 cream-canon-on-NEW-files guidance.
 * The pre-Wave-6 var(--color-*) tokens are preserved here so Practice
 * + Full Test render IDENTICALLY post-extraction. Cream-canon restyle
 * of these tokens is 5C.2b5's stated scope (alongside the rest of
 * WritingTab's ~80 functional refs).
 *
 * Header row (label + Notes button + word count badge) and Submit
 * button remain in WritingTab — they reach into modal state
 * (setNotesOpen, setSubmitConfirmOpen) and confirmation logic that
 * isn't editor-core scope.
 *
 * Q1 lock satisfied: spellCheck/autoCorrect/autoCapitalize all false.
 * These props were already applied unconditionally in WritingTab; the
 * extraction preserves them inside this NEW file.
 *
 * 5C.2b2 (PracticeShell) and 5C.2b3 (FullTestShell) will compose this
 * core differently:
 *   - PracticeShell wraps it in current WritingTab chrome (timer bar,
 *     mode toggle, etc.).
 *   - FullTestShell wraps it inside <WritingExamChrome> (5C.2a) with
 *     the render-prop API providing a sterile textarea className.
 */

import { type ChangeEventHandler, type ClipboardEventHandler, type MouseEventHandler } from "react";

export interface WritingEditorCoreProps {
  /** Controlled textarea value — owned by parent (WritingTab essayTexts). */
  value: string;
  /** onChange — parent updates essayTexts[taskType]. */
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  /** Paste blocker — parent fires showToast("Thi thật không cho phép paste"). */
  onPaste: ClipboardEventHandler<HTMLTextAreaElement>;
  /** Right-click blocker — parent calls e.preventDefault. */
  onContextMenu: MouseEventHandler<HTMLTextAreaElement>;
  /** Disables typing (paused timer or already-submitted Full Test task). */
  readOnly: boolean;
  /** Paused state — drives opacity + cursor (visual only). */
  paused: boolean;
  /** Localised placeholder per task. */
  placeholder: string;
  /** Live word count derived from value via countWords() in parent. */
  wordCount: number;
  /** Minimum word target for the active task (150 for T1, 250 for T2). */
  minRequired: number;
}

export default function WritingEditorCore({
  value,
  onChange,
  onPaste,
  onContextMenu,
  readOnly,
  paused,
  placeholder,
  wordCount,
  minRequired,
}: WritingEditorCoreProps) {
  return (
    <>
      <textarea
        value={value}
        onChange={onChange}
        onPaste={onPaste}
        onContextMenu={onContextMenu}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        readOnly={readOnly}
        placeholder={placeholder}
        rows={16}
        maxLength={5000}
        className="w-full rounded-lg px-4 py-3 text-sm leading-[1.8] resize-none transition-colors focus:outline-none flex-1"
        style={{
          background: "var(--color-bg-secondary)",
          border: `1px solid ${wordCount > 0 && wordCount < minRequired ? "rgba(239,68,68,0.3)" : "var(--color-border)"}`,
          color: "var(--color-text)",
          minHeight: "360px",
          opacity: paused ? 0.5 : 1,
          cursor: paused ? "not-allowed" : "text",
        }}
        onFocus={(e) => {
          if (!(wordCount > 0 && wordCount < minRequired)) {
            e.currentTarget.style.borderColor = "#00A896";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,168,150,0.1)";
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = wordCount > 0 && wordCount < minRequired ? "rgba(239,68,68,0.3)" : "var(--color-border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {/* Word count progress bar */}
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--surface-skeleton)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min((wordCount / minRequired) * 100, 100)}%`,
            background: wordCount >= minRequired ? "#16A34A" : wordCount > minRequired * 0.5 ? "#F59E0B" : "#EF4444",
          }}
        />
      </div>
    </>
  );
}
