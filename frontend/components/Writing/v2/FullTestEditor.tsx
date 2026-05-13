"use client";

/**
 * FullTestEditor — 2-tab Task 1 / Task 2 orchestration for
 * /exam/writing/full-test/active.
 *
 * On mount: startWritingFullTest() → bootstrap session + assigned prompts.
 * Per-task state: essay text + submitted flag.
 * Active tab toggles between Task 1 and Task 2.
 * Submit Task → submitWritingFullTestTask, mark submitted.
 * Both submitted OR timer hits zero → finalizeWritingFullTest → push to result.
 *
 * Reuses WritingEditorCore + WritingTimerBar. Timer is 60 min total,
 * no pause (Full Test rule).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import Mascot from "@/components/ui/Mascot";
import WritingEditorCore from "@/components/Writing/WritingEditorCore";
import WritingTimerBar from "@/components/Writing/WritingTimerBar";
import {
  startWritingFullTest,
  submitWritingFullTestTask,
  finalizeWritingFullTest,
} from "@/lib/api";
import type { WritingQuestionDetail, WritingTaskType } from "@/lib/types";
import { topicLabel } from "./topicTranslations";

const FULL_TEST_SECONDS = 60 * 60; // 60 minutes
const MIN_WORDS: Record<WritingTaskType, number> = { task1: 150, task2: 250 };

interface FullTestState {
  fullTestId: string;
  task1: WritingQuestionDetail;
  task2: WritingQuestionDetail;
  startedAt: string;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export default function FullTestEditor() {
  const router = useRouter();
  const [bootstrap, setBootstrap] = useState<FullTestState | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [activeTab, setActiveTab] = useState<WritingTaskType>("task1");
  const [essays, setEssays] = useState<Record<WritingTaskType, string>>({
    task1: "",
    task2: "",
  });
  const [submitted, setSubmitted] = useState<Record<WritingTaskType, boolean>>({
    task1: false,
    task2: false,
  });
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(FULL_TEST_SECONDS);
  const finalizeRef = useRef<() => Promise<void>>(async () => {});

  // Bootstrap session.
  useEffect(() => {
    let cancelled = false;
    startWritingFullTest()
      .then((res) => {
        if (cancelled) return;
        setBootstrap({
          fullTestId: res.full_test_id,
          task1: res.task1,
          task2: res.task2,
          startedAt: res.started_at,
        });
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Countdown.
  useEffect(() => {
    if (!bootstrap) return;
    const interval = setInterval(() => {
      setTimerSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [bootstrap]);

  // Auto-finalize on timeout.
  useEffect(() => {
    if (!bootstrap || timerSeconds > 0) return;
    void finalizeRef.current();
  }, [bootstrap, timerSeconds]);

  const handleFinalize = useCallback(async () => {
    if (!bootstrap || finalizing) return;
    setFinalizing(true);
    try {
      await finalizeWritingFullTest(bootstrap.fullTestId);
      router.push(`/exam/writing/full-test/${bootstrap.fullTestId}/result`);
    } catch {
      setFinalizing(false);
      setTaskError("Không nộp được bài thi. Thử lại nhé.");
    }
  }, [bootstrap, finalizing, router]);

  finalizeRef.current = handleFinalize;

  const handleSubmitTask = useCallback(
    async (task: WritingTaskType) => {
      if (!bootstrap || submitted[task] || taskSubmitting) return;
      setTaskSubmitting(true);
      setTaskError(null);
      const question = task === "task1" ? bootstrap.task1 : bootstrap.task2;
      try {
        await submitWritingFullTestTask(bootstrap.fullTestId, {
          taskType: task,
          questionText: question.question_text,
          essayText: essays[task].trim(),
          writingQuestionId: question.id,
        });
        setSubmitted((prev) => {
          const next = { ...prev, [task]: true };
          // Auto-flip to the other task if not yet submitted.
          if (task === "task1" && !next.task2) setActiveTab("task2");
          else if (task === "task2" && !next.task1) setActiveTab("task1");
          // Both submitted → finalize.
          if (next.task1 && next.task2) {
            void finalizeRef.current();
          }
          return next;
        });
      } catch (err) {
        setTaskError(
          err instanceof Error
            ? err.message
            : "Có lỗi xảy ra khi nộp task. Thử lại nhé.",
        );
      } finally {
        setTaskSubmitting(false);
      }
    },
    [bootstrap, submitted, taskSubmitting, essays],
  );

  if (loading) {
    return (
      <div className="max-w-[480px] mx-auto px-6 py-16 text-center">
        <Loader2
          className="w-6 h-6 mx-auto animate-spin"
          style={{ color: "var(--color-text-tertiary)" }}
          aria-hidden="true"
        />
        <p
          className="mt-3 text-sm"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Đang chuẩn bị đề thi...
        </p>
      </div>
    );
  }

  if (loadError || !bootstrap) {
    return (
      <div className="max-w-[480px] mx-auto px-6 py-16 text-center flex flex-col items-center gap-3">
        <Mascot size={80} mood="thinking" />
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Không khởi tạo được phiên thi. Thử lại sau nhé.
        </p>
        <Link
          href="/exam/writing/full-test"
          className="text-sm font-medium text-teal hover:text-teal-dark transition-colors"
        >
          Quay lại trang Full Test →
        </Link>
      </div>
    );
  }

  const currentQuestion = activeTab === "task1" ? bootstrap.task1 : bootstrap.task2;
  const currentEssay = essays[activeTab];
  const currentWords = countWords(currentEssay);
  const currentMin = MIN_WORDS[activeTab];
  const isCurrentSubmitted = submitted[activeTab];
  const canSubmitCurrent =
    !taskSubmitting && !isCurrentSubmitted && currentWords >= currentMin;

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--color-bg)" }}>
      <WritingTimerBar
        timerSeconds={timerSeconds}
        totalSeconds={FULL_TEST_SECONDS}
        modeBadge="Full Test"
      />

      <div className="max-w-[920px] mx-auto w-full px-6 lg:px-12 py-8 lg:py-10 flex-1 flex flex-col">
        {/* Tab switcher */}
        <div
          className="flex gap-1 mb-6 p-1 rounded-full self-start"
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
          }}
          role="tablist"
        >
          {(["task1", "task2"] as const).map((t) => {
            const isActive = activeTab === t;
            const isDone = submitted[t];
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(t)}
                className={[
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors duration-fast min-h-[40px]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40",
                  isActive
                    ? "bg-teal text-cream"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]",
                ].join(" ")}
              >
                {t === "task1" ? "Task 1" : "Task 2"}
                {isDone && (
                  <span aria-hidden="true" className="ml-1.5 opacity-70">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Eyebrow */}
        <div
          className="text-[10px] uppercase tracking-[0.16em] font-semibold mb-2"
          style={{ color: "#5DCAA5" }}
        >
          {topicLabel(currentQuestion.topic)}
        </div>

        {/* Title */}
        {currentQuestion.title && (
          <h1
            className="font-display italic text-[22px] sm:text-[26px] leading-tight mb-3"
            style={{ color: "var(--color-text)" }}
          >
            {currentQuestion.title}
          </h1>
        )}

        {/* Prompt */}
        <div
          className="rounded-lg p-5 mb-5"
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p
            className="text-[14px] sm:text-[15px] leading-relaxed italic"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {currentQuestion.question_text}
          </p>
        </div>

        {/* Editor */}
        <div className="flex flex-col gap-2 mb-5 flex-1">
          <div className="flex items-center justify-between gap-2">
            <label
              className="text-[10px] uppercase tracking-[0.16em] font-semibold"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Bài viết — {activeTab === "task1" ? "Task 1" : "Task 2"}
            </label>
            <span
              className="text-[12px] tabular-nums"
              style={{
                color:
                  currentWords >= currentMin
                    ? "#16A34A"
                    : currentWords > 0
                      ? "#F59E0B"
                      : "var(--color-text-tertiary)",
              }}
            >
              {currentWords}/{currentMin} từ
            </span>
          </div>
          <WritingEditorCore
            value={currentEssay}
            onChange={(e) =>
              setEssays((prev) => ({ ...prev, [activeTab]: e.target.value }))
            }
            onPaste={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            readOnly={isCurrentSubmitted || taskSubmitting || finalizing}
            paused={false}
            placeholder={
              activeTab === "task1"
                ? "Task 1 — viết tối thiểu 150 từ."
                : "Task 2 — viết tối thiểu 250 từ."
            }
            wordCount={currentWords}
            minRequired={currentMin}
          />
        </div>

        {/* Error */}
        {taskError && (
          <p className="mb-4 text-sm" style={{ color: "#EF4444" }} role="alert">
            {taskError}
          </p>
        )}

        {/* Submit row */}
        <div className="flex items-center justify-between gap-3">
          <p
            className="text-[13px]"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {isCurrentSubmitted
              ? "Đã nộp task này. Mở tab còn lại để viết tiếp."
              : currentWords >= currentMin
                ? "Đủ độ dài rồi — bạn nộp khi nào sẵn sàng."
                : `Cần thêm ${currentMin - currentWords} từ nữa.`}
          </p>
          <button
            type="button"
            onClick={() => handleSubmitTask(activeTab)}
            disabled={!canSubmitCurrent}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-teal text-cream font-semibold text-sm shadow-colored hover:bg-teal-dark transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(taskSubmitting || finalizing) && (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            )}
            {finalizing
              ? "Đang chấm bài..."
              : taskSubmitting
                ? "Đang nộp..."
                : isCurrentSubmitted
                  ? "Đã nộp"
                  : `Nộp ${activeTab === "task1" ? "Task 1" : "Task 2"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
