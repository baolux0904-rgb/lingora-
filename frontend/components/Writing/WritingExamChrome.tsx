"use client";

/**
 * WritingExamChrome — Wave 6 Sprint 5C.2a NEW component.
 *
 * Owns Full Test exam-mode chrome per Sprint 5A.2 Q1 + Q3 lock spec.
 * Sterile real-CD-IELTS layout — NO Lintopus mascot, NO Playfair italic
 * body, plain font-mono digits. Cream canon palette but minimal
 * decoration so the user gets comfortable with the real exam interface.
 *
 * Features:
 *   - Stopwatch countdown with red urgency tint last 10 min and pulse
 *     flash at exactly 10:00 + 5:00 remaining (matches CD-IELTS warning
 *     beats). Auto-submits when timer hits 0 via onComplete.
 *   - Settings panel popover: 3 font-size presets (sm/base/lg) + 3
 *     bg color presets (cream / white / sepia). Session-scope state,
 *     no persistence.
 *   - Hide button "bathroom break" overlay with Tiếp tục / Resume
 *     CTA. Stopwatch CONTINUES while hidden (real CD-IELTS behavior —
 *     honest exam simulation).
 *   - Bottom bar: Submit CTA + word counter slot.
 *
 * Visual delegation: parent passes the textarea + word counter as
 * children. WritingExamChrome wraps it in the chrome shell and exposes
 * fontSize + bgColor via render-prop child fn so the textarea can
 * react to Settings changes.
 *
 * Wired in by Sprint 5C.2b (WritingTab integration). Ships standalone
 * here so it compiles + tsc-clean + tree-shake-safe before any
 * consumer change.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

export type ExamFontSize = "sm" | "base" | "lg";
export type ExamBgColor = "cream" | "white" | "sepia";

export interface WritingExamChromeRenderProps {
  fontSize: ExamFontSize;
  bgColor: ExamBgColor;
  /**
   * Tailwind class string consumers should spread on their textarea
   * so font-size + bg-color settings flow through. Includes the
   * sterile font-sans family.
   */
  textareaClassName: string;
}

export interface WritingExamChromeProps {
  /** Total exam duration in seconds (e.g. 3600 for full Writing test). */
  durationSeconds: number;
  /** Called once when stopwatch hits 0. Parent should auto-submit. */
  onComplete: () => void;
  /** Called when user clicks Nộp bài. Parent runs the submission flow. */
  onSubmit: () => void;
  /** Optional: word count to display in bottom bar. */
  wordCount?: number;
  /**
   * Render-prop child receives the active fontSize + bgColor + a
   * pre-baked Tailwind class string for the textarea. Or pass a plain
   * ReactNode and ignore the props.
   */
  children:
    | ReactNode
    | ((render: WritingExamChromeRenderProps) => ReactNode);
}

const FONT_SIZE_TEXT: Record<ExamFontSize, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
};

const BG_COLOR_BG: Record<ExamBgColor, string> = {
  cream: "bg-cream",
  white: "bg-white",
  sepia: "bg-amber-50",
};

const FONT_SIZE_LABEL: Record<ExamFontSize, string> = {
  sm: "Nhỏ",
  base: "Vừa",
  lg: "Lớn",
};

const BG_COLOR_LABEL: Record<ExamBgColor, string> = {
  cream: "Kem",
  white: "Trắng",
  sepia: "Sepia",
};

function formatHMS(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function WritingExamChrome({
  durationSeconds,
  onComplete,
  onSubmit,
  wordCount,
  children,
}: WritingExamChromeProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [fontSize, setFontSize] = useState<ExamFontSize>("base");
  const [bgColor, setBgColor] = useState<ExamBgColor>("cream");
  const [showSettings, setShowSettings] = useState(false);
  const [hidden, setHidden] = useState(false);
  const completedRef = useRef(false);

  // Stopwatch tick — runs even while hidden (real CD-IELTS behavior).
  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
      return;
    }
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft, onComplete]);

  // Flash beats: animate-pulse for ~3s window around exactly 10:00 and 5:00.
  const isFlashBeat = secondsLeft === 600 || secondsLeft === 300;
  // Last 10 minutes: red urgency tint on the digits.
  const isUrgent = secondsLeft <= 600 && secondsLeft > 0;

  const containerBg = BG_COLOR_BG[bgColor];
  const textareaClassName =
    `${BG_COLOR_BG[bgColor]} ${FONT_SIZE_TEXT[fontSize]} ` +
    `font-sans text-navy w-full px-4 py-3 leading-relaxed resize-none ` +
    `border border-navy/10 rounded-md focus:outline-none focus:border-teal/40 ` +
    `placeholder:text-navy-light/50`;

  const renderProps: WritingExamChromeRenderProps = {
    fontSize,
    bgColor,
    textareaClassName,
  };

  return (
    <div
      className={`min-h-dvh flex flex-col font-sans ${containerBg} text-navy`}
      data-exam-mode="writing-full-test"
    >
      {/* Top chrome bar — stopwatch + settings + hide */}
      <header className="shrink-0 border-b border-navy/10 bg-cream-soft">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-3">
          {/* Stopwatch */}
          <div
            className={
              "flex items-center gap-2 " +
              (isFlashBeat ? "animate-pulse" : "")
            }
            role="timer"
            aria-live="off"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isUrgent ? "text-red-500" : "text-navy"}
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span
              className={
                "font-mono tabular-nums text-2xl leading-none min-w-[80px] " +
                (isUrgent ? "text-red-500 font-semibold" : "text-navy")
              }
            >
              {formatHMS(Math.max(secondsLeft, 0))}
            </span>
          </div>

          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-navy text-white shrink-0">
            Full Test
          </span>

          <div className="flex-1" />

          {/* Settings */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSettings((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-navy/10 bg-cream-warm text-navy-light hover:text-navy hover:border-teal/30 transition-colors"
              aria-expanded={showSettings}
              aria-label="Tùy chỉnh"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Tùy chỉnh</span>
            </button>

            {showSettings && (
              <>
                {/* Click-outside scrim */}
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setShowSettings(false)}
                  aria-label="Đóng tùy chỉnh"
                  tabIndex={-1}
                />
                <div className="absolute right-0 mt-2 w-64 z-50 rounded-lg bg-cream-warm border border-navy/10 shadow-lg p-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-navy-light/70">
                      Cỡ chữ
                    </span>
                    <div className="flex gap-2">
                      {(["sm", "base", "lg"] as ExamFontSize[]).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setFontSize(sz)}
                          className={
                            "flex-1 py-1.5 rounded-md text-sm border transition-colors " +
                            (fontSize === sz
                              ? "bg-teal text-white border-teal"
                              : "bg-cream text-navy border-navy/10 hover:border-teal/30")
                          }
                        >
                          {FONT_SIZE_LABEL[sz]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-navy-light/70">
                      Nền
                    </span>
                    <div className="flex gap-2">
                      {(["cream", "white", "sepia"] as ExamBgColor[]).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setBgColor(c)}
                          className={
                            "flex-1 py-1.5 rounded-md text-sm border transition-colors " +
                            (bgColor === c
                              ? "bg-teal text-white border-teal"
                              : "bg-cream text-navy border-navy/10 hover:border-teal/30")
                          }
                        >
                          {BG_COLOR_LABEL[c]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Hide button — bathroom break */}
          <button
            type="button"
            onClick={() => setHidden(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-navy/10 bg-cream-warm text-navy-light hover:text-navy hover:border-teal/30 transition-colors"
            aria-label="Tạm ẩn bài thi"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <span>Tạm ẩn</span>
          </button>
        </div>
      </header>

      {/* Body — children render slot. Render-prop fn or plain node. */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 py-4 flex flex-col gap-3">
        {typeof children === "function" ? children(renderProps) : children}
      </main>

      {/* Bottom bar — word count + Submit */}
      <footer className="shrink-0 border-t border-navy/10 bg-cream-soft">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-3">
          {wordCount !== undefined && (
            <span className="text-sm text-navy-light tabular-nums">
              {wordCount} từ
            </span>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onSubmit}
            className="px-5 py-2 rounded-md text-sm font-medium bg-teal text-white hover:bg-teal-dark transition-colors"
          >
            Nộp bài
          </button>
        </div>
      </footer>

      {/* Hide overlay — bathroom break. Stopwatch keeps ticking behind. */}
      {hidden && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-navy/95 text-cream"
          role="dialog"
          aria-modal="true"
          aria-label="Bài thi đang tạm ẩn"
        >
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <div className="text-sm uppercase tracking-wider text-cream/70">
              Bài thi đang tạm ẩn
            </div>
            <div className="font-mono tabular-nums text-3xl">
              {formatHMS(Math.max(secondsLeft, 0))}
            </div>
            <p className="text-sm text-cream/80 max-w-xs">
              Đồng hồ vẫn chạy như thi thật. Sẵn sàng quay lại bài làm?
            </p>
            <button
              type="button"
              onClick={() => setHidden(false)}
              className="mt-2 px-6 py-2.5 rounded-md text-sm font-medium bg-teal text-white hover:bg-teal-dark transition-colors"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
