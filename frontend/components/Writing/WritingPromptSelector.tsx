"use client";

/**
 * WritingPromptSelector — landing screen inside WritingTab (Practice mode).
 *
 * Lets the user pick a curated prompt instead of typing the question by hand.
 * Filters: task type, topic, difficulty. Attempted prompts carry a teal ✓
 * badge. Click a card → record attempt → hand the full prompt back to the
 * parent via onSelect so WritingTab can hydrate its per-task buffers.
 *
 * Full Test mode bypasses this component (WritingTab calls startWritingFullTest
 * directly).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listWritingQuestions,
  listWritingQuestionTopics,
  getWritingQuestion,
  recordWritingAttempt,
} from "@/lib/api";
import type {
  WritingTaskType,
  WritingDifficulty,
  WritingQuestionListItem,
  WritingQuestionDetail,
} from "@/lib/types";

interface WritingPromptSelectorProps {
  onSelect: (prompt: WritingQuestionDetail) => void;
}

const DIFFICULTY_LABEL: Record<WritingDifficulty, string> = {
  band_5_6: "Band 5-6",
  band_6_7: "Band 6-7",
  band_7_8: "Band 7-8",
};

const DIFFICULTY_OPTIONS: { value: WritingDifficulty | ""; label: string }[] = [
  { value: "", label: "Tất cả band" },
  { value: "band_5_6", label: DIFFICULTY_LABEL.band_5_6 },
  { value: "band_6_7", label: DIFFICULTY_LABEL.band_6_7 },
  { value: "band_7_8", label: DIFFICULTY_LABEL.band_7_8 },
];

function describeEssayType(type: string | null | undefined): string {
  switch (type) {
    case "opinion": return "Opinion";
    case "discussion": return "Discussion";
    case "problem_solution": return "Problem / Solution";
    case "advantages_disadvantages": return "Advantages / Disadvantages";
    case "two_part_question": return "Two-part question";
    default: return "";
  }
}

function describeChartType(type: string | null | undefined): string {
  switch (type) {
    case "line": return "Line graph";
    case "bar": return "Bar chart";
    case "pie": return "Pie chart";
    case "table": return "Table";
    default: return "";
  }
}

export default function WritingPromptSelector({ onSelect }: WritingPromptSelectorProps) {
  const [taskType, setTaskType] = useState<WritingTaskType>("task2");
  const [topic, setTopic] = useState<string>("");
  const [difficulty, setDifficulty] = useState<WritingDifficulty | "">("");
  const [onlyUnattempted, setOnlyUnattempted] = useState(false);

  const [topics, setTopics] = useState<string[]>([]);
  const [questions, setQuestions] = useState<WritingQuestionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<string | null>(null);

  // Load topics once per task type
  useEffect(() => {
    let cancelled = false;
    listWritingQuestionTopics(taskType)
      .then((res) => { if (!cancelled) setTopics(res.topics); })
      .catch(() => { if (!cancelled) setTopics([]); });
    return () => { cancelled = true; };
  }, [taskType]);

  // Reset topic when task type changes
  useEffect(() => {
    setTopic("");
  }, [taskType]);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listWritingQuestions({
        taskType,
        topic: topic || undefined,
        difficulty: difficulty || undefined,
        excludeAttempted: onlyUnattempted,
        limit: 60,
      });
      setQuestions(res.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được danh sách đề");
    } finally {
      setLoading(false);
    }
  }, [taskType, topic, difficulty, onlyUnattempted]);

  useEffect(() => { void loadQuestions(); }, [loadQuestions]);

  const handleSelect = useCallback(async (id: string) => {
    if (selecting) return;
    setSelecting(id);
    try {
      // Fire and forget — fetching the detail is the user-blocking step.
      await Promise.all([
        recordWritingAttempt(id).catch(() => null),
        getWritingQuestion(id).then(onSelect),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không mở được đề");
    } finally {
      setSelecting(null);
    }
  }, [selecting, onSelect]);

  const gridClass = useMemo(
    () => "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3",
    []
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Task type toggle */}
      <div
        className="flex rounded-xl overflow-hidden"
        style={{ background: "var(--surface-primary)", border: "1px solid var(--surface-border)", boxShadow: "var(--surface-shadow)" }}
      >
        {(["task1", "task2"] as WritingTaskType[]).map((t) => {
          const active = taskType === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTaskType(t)}
              className="flex-1 py-2.5 text-sm font-medium transition-all cursor-pointer"
              style={{
                background: active ? "var(--color-accent)" : "transparent",
                color: active ? "#fff" : "var(--color-text-secondary)",
              }}
            >
              {t === "task1" ? "Task 1 (~20 min)" : "Task 2 (~40 min)"}
            </button>
          );
        })}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm focus:outline-none"
          style={{
            background: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
          aria-label="Chọn chủ đề"
        >
          <option value="">Tất cả chủ đề</option>
          {topics.map((tp) => (
            <option key={tp} value={tp}>{tp}</option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as WritingDifficulty | "")}
          className="rounded-lg px-3 py-2 text-sm focus:outline-none"
          style={{
            background: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
          aria-label="Chọn độ khó"
        >
          {DIFFICULTY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <label
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer"
          style={{
            background: onlyUnattempted ? "rgba(0,168,150,0.10)" : "var(--color-bg-secondary)",
            color: onlyUnattempted ? "#00A896" : "var(--color-text-secondary)",
            border: "1px solid var(--color-border)",
          }}
        >
          <input
            type="checkbox"
            checked={onlyUnattempted}
            onChange={(e) => setOnlyUnattempted(e.target.checked)}
            className="accent-teal-600"
          />
          Chưa làm
        </label>
        <span className="text-xs ml-auto" style={{ color: "var(--color-text-tertiary)" }}>
          {loading ? "Đang tải..." : `${questions.length} đề`}
        </span>
      </div>

      {/* Error / empty / list */}
      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          {error}
        </div>
      )}

      {!loading && !error && questions.length === 0 && (
        <div
          className="rounded-xl px-4 py-8 text-center text-sm"
          style={{ background: "var(--surface-primary)", color: "var(--color-text-tertiary)", border: "1px solid var(--surface-border)" }}
        >
          Chưa có đề phù hợp với bộ lọc này.
        </div>
      )}

      {loading && (
        <div className={gridClass}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="rounded-xl p-4 h-40 animate-pulse"
              style={{ background: "var(--surface-skeleton)" }}
            />
          ))}
        </div>
      )}

      {!loading && questions.length > 0 && (
        <div className={gridClass}>
          {questions.map((q) => {
            const secondary = q.task_type === "task1" ? describeChartType(q.chart_type) : describeEssayType(q.essay_type);
            const headline = q.task_type === "task1"
              ? (q.title || q.question_text.slice(0, 80))
              : q.question_text.length > 120 ? `${q.question_text.slice(0, 120)}…` : q.question_text;
            const isSelecting = selecting === q.id;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => void handleSelect(q.id)}
                disabled={isSelecting}
                className="relative text-left rounded-xl p-4 flex flex-col gap-3 transition-all cursor-pointer disabled:opacity-60"
                style={{
                  background: "var(--surface-primary)",
                  border: `1px solid ${q.attempted ? "rgba(0,168,150,0.3)" : "var(--surface-border)"}`,
                  boxShadow: "var(--surface-shadow)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "#00A896"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = q.attempted ? "rgba(0,168,150,0.3)" : "var(--surface-border)"; }}
              >
                {q.attempted && (
                  <span
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: "#00A896", color: "#fff" }}
                    aria-label="Đã làm"
                    title="Đã làm"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                    style={{ background: "rgba(0,168,150,0.08)", color: "#00A896" }}
                  >
                    {q.topic}
                  </span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                    style={{ background: "var(--color-bg-secondary)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}
                  >
                    {DIFFICULTY_LABEL[q.difficulty]}
                  </span>
                  {secondary && (
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ background: "rgba(27,43,75,0.08)", color: "#1B2B4B" }}
                    >
                      {secondary}
                    </span>
                  )}
                </div>
                <p
                  className="text-sm leading-snug"
                  style={{ color: "var(--color-text)" }}
                >
                  {headline}
                </p>
                {isSelecting && (
                  <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    Đang mở đề...
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
