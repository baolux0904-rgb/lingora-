"use client";

/**
 * EditorialEssayPicker — anthology-style essay list for /exam/writing/practice/{task1,task2}.
 *
 * Hairline divider entries, numbered prefix, Vietnamese topic eyebrow,
 * Playfair italic paraphrased title, 2-line English preview from
 * question_text. Filter chips at top from /writing/questions/topics.
 * Done-state inline meta when prompt was previously attempted.
 *
 * Reuses existing /writing/questions endpoint via listWritingQuestions.
 * No mutations to existing components.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ArrowRight } from "lucide-react";
import Mascot from "@/components/ui/Mascot";
import { listWritingQuestions, listWritingQuestionTopics } from "@/lib/api";
import type {
  WritingQuestionListItem,
  WritingTaskType,
} from "@/lib/types";
import {
  topicLabel,
  difficultyLabel,
  translatePromptTitle,
} from "./topicTranslations";

interface EditorialEssayPickerProps {
  taskType: WritingTaskType;
}

const TASK_LABEL: Record<WritingTaskType, string> = {
  task1: "Task 1",
  task2: "Task 2",
};

export default function EditorialEssayPicker({ taskType }: EditorialEssayPickerProps) {
  const router = useRouter();
  const [topics, setTopics] = useState<string[]>([]);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [questions, setQuestions] = useState<WritingQuestionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch topics once.
  useEffect(() => {
    let cancelled = false;
    listWritingQuestionTopics(taskType)
      .then((res) => {
        if (!cancelled) setTopics(res.topics ?? []);
      })
      .catch(() => {
        /* silent — filter pills just won't render if topics fail */
      });
    return () => {
      cancelled = true;
    };
  }, [taskType]);

  // Fetch questions on mount + when activeTopic changes.
  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await listWritingQuestions({
        taskType,
        topic: activeTopic ?? undefined,
        limit: 50,
      });
      setQuestions(res.questions ?? []);
    } catch {
      setError(true);
    }
    setLoading(false);
  }, [taskType, activeTopic]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSelect = (questionId: string) => {
    router.push(`/exam/writing/practice/${questionId}`);
  };

  return (
    <div className="max-w-[920px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium mb-8">
        <Link
          href="/exam/writing/practice"
          className="inline-flex items-center gap-1 transition-colors hover:text-teal"
          style={{ color: "#5DCAA5" }}
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
          Luyện tập
        </Link>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ color: "var(--color-text-tertiary)" }}>{TASK_LABEL[taskType]}</span>
      </nav>

      {/* Header */}
      <header className="mb-10 lg:mb-12">
        <h1
          className="font-display italic text-[32px] sm:text-[40px] leading-tight tracking-tighter"
          style={{ color: "var(--color-text)" }}
        >
          Chọn đề {TASK_LABEL[taskType]}
        </h1>
        <p
          className="mt-3 text-[15px] sm:text-[16px] leading-relaxed max-w-[560px]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Mỗi đề mở ra trang viết riêng. Bạn viết xong, AI chấm theo bốn tiêu chí IELTS.
        </p>
      </header>

      {/* Topic filter pills */}
      {topics.length > 0 && (
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-1 px-1 mb-10">
          <button
            onClick={() => setActiveTopic(null)}
            aria-pressed={activeTopic === null}
            className={[
              "px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap shrink-0 min-h-[44px]",
              "transition-colors duration-fast",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
              activeTopic === null
                ? "bg-teal text-cream shadow-colored"
                : "bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[rgba(27,43,75,0.05)] hover:text-[var(--color-text)]",
            ].join(" ")}
          >
            Tất cả
          </button>
          {topics.map((t) => {
            const isActive = activeTopic === t;
            return (
              <button
                key={t}
                onClick={() => setActiveTopic(t)}
                aria-pressed={isActive}
                className={[
                  "px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap shrink-0 min-h-[44px]",
                  "transition-colors duration-fast",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
                  isActive
                    ? "bg-teal text-cream shadow-colored"
                    : "bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[rgba(27,43,75,0.05)] hover:text-[var(--color-text)]",
                ].join(" ")}
              >
                {topicLabel(t)}
              </button>
            );
          })}
        </div>
      )}

      {/* List body */}
      {loading ? (
        <div
          className="py-16 text-center text-sm"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Đang tải đề...
        </div>
      ) : error ? (
        <div className="py-16 text-center flex flex-col items-center gap-3">
          <Mascot size={80} mood="thinking" />
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Có lỗi xảy ra khi tải đề. Thử lại sau nhé.
          </p>
        </div>
      ) : questions.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center gap-3 max-w-[480px] mx-auto">
          <Mascot size={80} mood="default" />
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Chưa có đề trong nhóm này.
          </p>
          {activeTopic && (
            <button
              onClick={() => setActiveTopic(null)}
              className="text-sm font-medium text-teal hover:text-teal-dark transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded-md px-2 py-1"
            >
              Xem tất cả đề →
            </button>
          )}
        </div>
      ) : (
        <ul className="list-none p-0 m-0">
          {questions.map((q, idx) => {
            const isAttempted = Boolean(q.attempted);
            return (
              <li
                key={q.id}
                className="border-t"
                style={{ borderColor: "rgba(229,220,198,0.16)" }}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(q.id)}
                  className="group w-full text-left py-7 lg:py-9 transition-colors duration-fast focus:outline-none focus-visible:bg-[rgba(0,168,150,0.04)]"
                >
                  <div className="flex items-start gap-4 sm:gap-6">
                    <span
                      className="font-display italic text-[22px] sm:text-[26px] tabular-nums shrink-0 mt-0.5"
                      style={{
                        color: "var(--color-text-tertiary)",
                        opacity: isAttempted ? 0.55 : 1,
                      }}
                      aria-hidden="true"
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div
                        className="text-[10px] uppercase tracking-[0.16em] font-semibold mb-1.5"
                        style={{ color: "#5DCAA5" }}
                      >
                        {topicLabel(q.topic)}
                        {q.difficulty && (
                          <span
                            className="ml-2"
                            style={{ color: "var(--color-text-tertiary)", letterSpacing: "0.12em" }}
                          >
                            · {difficultyLabel(q.difficulty)}
                          </span>
                        )}
                      </div>
                      <h2
                        className="font-display italic text-[19px] sm:text-[22px] leading-snug mb-1.5"
                        style={{
                          color: "var(--color-text)",
                          opacity: isAttempted ? 0.7 : 1,
                        }}
                      >
                        {translatePromptTitle(q.question_text ?? "", q.title)}
                      </h2>
                      <p
                        className="text-[13px] sm:text-[14px] italic leading-relaxed line-clamp-2"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        {q.question_text}
                      </p>
                      {isAttempted && (
                        <p
                          className="mt-2.5 text-[12px]"
                          style={{ color: "var(--color-text-tertiary)" }}
                        >
                          Đã viết
                        </p>
                      )}
                    </div>

                    <ArrowRight
                      className="w-4 h-4 mt-2 shrink-0 transition-transform duration-fast group-hover:translate-x-1"
                      strokeWidth={2}
                      style={{ color: "var(--color-text-tertiary)" }}
                      aria-hidden="true"
                    />
                  </div>
                </button>
              </li>
            );
          })}
          <li
            className="border-t"
            style={{ borderColor: "rgba(229,220,198,0.16)" }}
            aria-hidden="true"
          />
        </ul>
      )}
    </div>
  );
}
