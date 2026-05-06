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
 *
 * Wave 6 Sprint 5C.1c — restyled to cream canon (bg-cream-warm,
 * border-navy/10, font-display Playfair, font-sans DM Sans) matching
 * WritingResult.tsx (Sprint 5C.1b ship). All var(--color-*) +
 * var(--surface-*) refs eliminated. Hover transform handled via Tailwind
 * (hover:-translate-y-0.5 hover:border-teal) instead of inline mouse
 * handlers — same visual, less imperative.
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
      <div className="flex rounded-xl overflow-hidden bg-cream-warm border border-navy/10">
        {(["task1", "task2"] as WritingTaskType[]).map((t) => {
          const active = taskType === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTaskType(t)}
              className={
                "flex-1 py-2.5 text-sm font-medium transition-all cursor-pointer font-sans " +
                (active ? "bg-teal text-white" : "bg-transparent text-navy-light")
              }
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
          className="rounded-lg px-3 py-2 text-sm focus:outline-none bg-cream-warm border border-navy/10 text-navy font-sans"
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
          className="rounded-lg px-3 py-2 text-sm focus:outline-none bg-cream-warm border border-navy/10 text-navy font-sans"
          aria-label="Chọn độ khó"
        >
          {DIFFICULTY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <label
          className={
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer font-sans border border-navy/10 transition-colors " +
            (onlyUnattempted ? "bg-teal/10 text-teal" : "bg-cream-warm text-navy-light")
          }
        >
          <input
            type="checkbox"
            checked={onlyUnattempted}
            onChange={(e) => setOnlyUnattempted(e.target.checked)}
            className="accent-teal"
          />
          Chưa làm
        </label>
        <span className="text-xs ml-auto text-navy-light/70 font-sans">
          {loading ? "Đang tải..." : `${questions.length} đề`}
        </span>
      </div>

      {/* Error / empty / list */}
      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm font-sans"
          style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          {error}
        </div>
      )}

      {!loading && !error && questions.length === 0 && (
        <div className="rounded-xl px-4 py-8 text-center text-sm bg-cream-warm border border-navy/10 text-navy-light/70 font-sans">
          Chưa có đề phù hợp với bộ lọc này.
        </div>
      )}

      {loading && (
        <div className={gridClass}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="rounded-xl p-4 h-40 animate-pulse bg-cream-warm border border-navy/10"
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
                className={
                  "relative text-left rounded-xl p-4 flex flex-col gap-3 cursor-pointer disabled:opacity-60 " +
                  "bg-cream-warm border transition-all duration-200 " +
                  "hover:-translate-y-0.5 hover:border-teal " +
                  (q.attempted ? "border-teal/30" : "border-navy/10")
                }
              >
                {q.attempted && (
                  <span
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-teal text-white"
                    aria-label="Đã làm"
                    title="Đã làm"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-teal/10 text-teal font-sans">
                    {q.topic}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-cream-soft text-navy-light border border-navy/10 font-sans">
                    {DIFFICULTY_LABEL[q.difficulty]}
                  </span>
                  {secondary && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-navy/10 text-navy font-sans">
                      {secondary}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-snug text-navy font-sans">
                  {headline}
                </p>
                {isSelecting && (
                  <span className="text-xs text-navy-light/70 font-sans">
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
