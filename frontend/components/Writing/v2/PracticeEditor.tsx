"use client";

/**
 * PracticeEditor — single-task editor shell for /exam/writing/practice/[questionId].
 *
 * Loads question detail, wraps WritingEditorCore, sticky submit CTA at
 * bottom. On submit → submitWritingEssay → push to existing legacy
 * result viewer (/writing/result/[submissionId] mounted via WritingTab
 * — or future v2 result page if scoped).
 *
 * Records attempt on mount (analytics; non-blocking).
 * No timer (Practice mode is open-ended).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import Mascot from "@/components/ui/Mascot";
import WritingEditorCore from "@/components/Writing/WritingEditorCore";
import WritingChartRenderer from "@/components/Writing/WritingChartRenderer";
import {
  getWritingQuestion,
  recordWritingAttempt,
  submitWritingEssay,
} from "@/lib/api";
import type { WritingQuestionDetail } from "@/lib/types";
import { topicLabel, difficultyLabel } from "./topicTranslations";

/**
 * Task 1 chart panel — wraps WritingChartRenderer with the editorial card chrome
 * + a peer-voice placeholder when the prompt has no chart_data yet (seed gap).
 * Task 2 callers must skip this component entirely.
 */
function Task1ChartPanel({ question }: { question: WritingQuestionDetail }) {
  if (question.task_type !== "task1") return null;

  const hasChart = question.chart_type != null && question.chart_data != null;

  return (
    <div
      className="rounded-md p-4 mb-4 overflow-x-auto"
      style={{
        background: "var(--color-bg-card)",
        border: "0.5px solid var(--color-border)",
        minHeight: hasChart ? "240px" : undefined,
        maxHeight: "400px",
        overflowY: "auto",
      }}
    >
      {hasChart ? (
        <WritingChartRenderer
          chartType={question.chart_type!}
          data={question.chart_data}
        />
      ) : (
        <p
          className="text-[13px] sm:text-[14px] italic leading-relaxed text-center py-6"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Đề này chưa có biểu đồ — mình đang thêm vào, bạn vẫn viết tả dữ liệu theo prompt được nha.
        </p>
      )}
    </div>
  );
}

const MIN_WORDS: Record<"task1" | "task2", number> = {
  task1: 150,
  task2: 250,
};

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

interface PracticeEditorProps {
  questionId: string;
}

export default function PracticeEditor({ questionId }: PracticeEditorProps) {
  const router = useRouter();
  const [question, setQuestion] = useState<WritingQuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [essayText, setEssayText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load question detail.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    getWritingQuestion(questionId)
      .then((q) => {
        if (cancelled) return;
        setQuestion(q);
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
  }, [questionId]);

  // Record attempt (non-blocking).
  useEffect(() => {
    if (!question) return;
    recordWritingAttempt(question.id).catch(() => {
      /* analytics-only — silent */
    });
  }, [question]);

  const wordCount = useMemo(() => countWords(essayText), [essayText]);
  const minRequired = question ? MIN_WORDS[question.task_type] : 250;
  const canSubmit = !submitting && wordCount >= minRequired;

  const handleSubmit = useCallback(async () => {
    if (!question || !canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { submissionId } = await submitWritingEssay({
        taskType: question.task_type,
        questionText: question.question_text,
        essayText: essayText.trim(),
        writingQuestionId: question.id,
      });
      router.push(`/writing/result/${submissionId}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi nộp bài. Thử lại nhé.",
      );
      setSubmitting(false);
    }
  }, [question, canSubmit, essayText, router]);

  if (loading) {
    return (
      <div className="max-w-[920px] mx-auto px-6 lg:px-12 py-16 text-center">
        <Loader2
          className="w-6 h-6 mx-auto animate-spin"
          style={{ color: "var(--color-text-tertiary)" }}
          aria-hidden="true"
        />
        <p
          className="mt-3 text-sm"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Đang tải đề...
        </p>
      </div>
    );
  }

  if (loadError || !question) {
    return (
      <div className="max-w-[480px] mx-auto px-6 py-16 text-center flex flex-col items-center gap-3">
        <Mascot size={80} mood="thinking" />
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Không tải được đề. Quay lại danh sách và thử đề khác nhé.
        </p>
        <Link
          href="/exam/writing/practice"
          className="text-sm font-medium text-teal hover:text-teal-dark transition-colors"
        >
          Quay lại danh sách đề →
        </Link>
      </div>
    );
  }

  const backHref =
    question.task_type === "task1"
      ? "/exam/writing/practice/task1"
      : "/exam/writing/practice/task2";

  return (
    <div className="max-w-[920px] mx-auto px-6 lg:px-12 py-10 lg:py-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium mb-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 transition-colors hover:text-teal"
          style={{ color: "#5DCAA5" }}
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
          {question.task_type === "task1" ? "Task 1" : "Task 2"}
        </Link>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ color: "var(--color-text-tertiary)" }}>Đang viết</span>
      </nav>

      {/* Eyebrow */}
      <div
        className="text-[10px] uppercase tracking-[0.16em] font-semibold mb-2"
        style={{ color: "#5DCAA5" }}
      >
        {topicLabel(question.topic)}
        {question.difficulty && (
          <span
            className="ml-2"
            style={{ color: "var(--color-text-tertiary)", letterSpacing: "0.12em" }}
          >
            · {difficultyLabel(question.difficulty)}
          </span>
        )}
      </div>

      {/* Title */}
      {question.title && (
        <h1
          className="font-display italic text-[24px] sm:text-[28px] leading-tight mb-4"
          style={{ color: "var(--color-text)" }}
        >
          {question.title}
        </h1>
      )}

      {/* Task 1 chart (visual stimulus) — rendered above the prompt */}
      <Task1ChartPanel question={question} />

      {/* Question prompt (English original) */}
      <div
        className="rounded-lg p-5 lg:p-6 mb-6"
        style={{
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
        }}
      >
        <p
          className="text-[14px] sm:text-[15px] leading-relaxed italic"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {question.question_text}
        </p>
      </div>

      {/* Editor */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center justify-between gap-2">
          <label
            className="text-[10px] uppercase tracking-[0.16em] font-semibold"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Bài viết của bạn
          </label>
          <span
            className="text-[12px] tabular-nums"
            style={{
              color:
                wordCount >= minRequired
                  ? "#16A34A"
                  : wordCount > 0
                    ? "#F59E0B"
                    : "var(--color-text-tertiary)",
            }}
          >
            {wordCount}/{minRequired} từ
          </span>
        </div>
        <WritingEditorCore
          value={essayText}
          onChange={(e) => setEssayText(e.target.value)}
          onPaste={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          readOnly={submitting}
          paused={false}
          placeholder={
            question.task_type === "task1"
              ? "Viết tối thiểu 150 từ. Mở bài, mô tả các đặc điểm chính, so sánh."
              : "Viết tối thiểu 250 từ. Mở bài, lập luận với ví dụ cụ thể, kết luận."
          }
          wordCount={wordCount}
          minRequired={minRequired}
        />
      </div>

      {/* Error */}
      {submitError && (
        <p
          className="mb-4 text-sm"
          style={{ color: "#EF4444" }}
          role="alert"
        >
          {submitError}
        </p>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between gap-3">
        <p
          className="text-[13px]"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {wordCount >= minRequired
            ? "Đủ độ dài rồi — bạn nộp khi nào sẵn sàng."
            : `Cần thêm ${minRequired - wordCount} từ nữa để đủ độ dài.`}
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-teal text-cream font-semibold text-sm shadow-colored hover:bg-teal-dark transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          {submitting ? "Đang nộp..." : "Nộp bài để chấm"}
        </button>
      </div>
    </div>
  );
}
