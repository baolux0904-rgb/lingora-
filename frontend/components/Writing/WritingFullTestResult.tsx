"use client";

/**
 * WritingFullTestResult — shows the aggregated result of one Full Test
 * run (migration 0036). Fetches both linked submissions + the weighted
 * overall band, renders a hero summary, and lets the user flip between
 * Task 1 and Task 2 each of which reuses the existing single-essay
 * WritingResult.
 *
 * Polls while either submission is still status='pending' so the UI
 * catches up with the fire-and-forget AI scoring pipeline.
 */

import { useCallback, useEffect, useState } from "react";
import { getWritingFullTest } from "@/lib/api";
import { bandColor } from "@/lib/bandColors";
import WritingResult from "./WritingResult";
import type { WritingFullTestDetail } from "@/lib/types";

interface WritingFullTestResultProps {
  fullTestId: string;
  onBack: () => void;
}

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 20; // 60s budget — matches existing useWritingResult

export default function WritingFullTestResult({ fullTestId, onBack }: WritingFullTestResultProps) {
  const [detail, setDetail] = useState<WritingFullTestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "task1" | "task2">("overview");

  const fetchDetail = useCallback(async () => {
    try {
      const d = await getWritingFullTest(fullTestId);
      setDetail(d);
      return d;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được Full Test");
      return null;
    } finally {
      setLoading(false);
    }
  }, [fullTestId]);

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;
    const loop = async () => {
      const d = await fetchDetail();
      if (cancelled || !d) return;
      const stillPending =
        d.task1_submission?.status === "pending" ||
        d.task2_submission?.status === "pending";
      if (stillPending && attempt < MAX_POLL_ATTEMPTS) {
        attempt += 1;
        setTimeout(loop, POLL_INTERVAL_MS);
      }
    };
    void loop();
    return () => { cancelled = true; };
  }, [fetchDetail]);

  if (loading && !detail) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
        />
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Đang tổng hợp kết quả Full Test…
        </p>
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>
        <button onClick={onBack} className="px-4 py-2 rounded-lg text-sm" style={{ background: "var(--color-accent)", color: "#fff" }}>
          Quay lại
        </button>
      </div>
    );
  }

  if (!detail) return null;

  const { full_test, task1_submission, task2_submission, overall_band, per_criteria_avg } = detail;
  const color = overall_band != null ? bandColor(overall_band) : "var(--color-text-tertiary)";
  const durationMin =
    full_test.total_time_used_seconds != null
      ? Math.round(full_test.total_time_used_seconds / 60)
      : null;
  const task1Band = task1_submission?.overall_band != null ? Number(task1_submission.overall_band) : null;
  const task2Band = task2_submission?.overall_band != null ? Number(task2_submission.overall_band) : null;
  const pending =
    task1_submission?.status === "pending" || task2_submission?.status === "pending";

  return (
    <div className="flex flex-col gap-5 pb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium self-start"
        style={{ color: "var(--color-accent)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Quay lại
      </button>

      {/* Hero summary */}
      <div
        className="rounded-xl p-6 text-center flex flex-col gap-2"
        style={{
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
          Kết quả Full Test
        </div>
        <div className="text-5xl font-bold" style={{ color }}>
          {overall_band != null ? overall_band.toFixed(1) : "—"}
        </div>
        <div className="text-xs flex items-center justify-center flex-wrap gap-2" style={{ color: "var(--color-text-tertiary)" }}>
          <span>Overall band · Task 2 ×2 + Task 1 ×1</span>
          {durationMin != null && <span>· {durationMin} phút</span>}
          {pending && (
            <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
              Đang chấm…
            </span>
          )}
        </div>
      </div>

      {/* Per-task bands */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: "task1" as const, label: "Task 1", band: task1Band },
          { key: "task2" as const, label: "Task 2", band: task2Band },
        ].map((x) => (
          <button
            key={x.key}
            onClick={() => setActiveTab(x.key)}
            className="rounded-lg p-4 text-left transition-all cursor-pointer"
            style={{
              background: "var(--color-bg-card)",
              border: `1px solid ${activeTab === x.key ? "var(--color-accent)" : "var(--color-border)"}`,
            }}
          >
            <div className="text-xs uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
              {x.label}
            </div>
            <div
              className="text-3xl font-bold mt-1"
              style={{ color: x.band != null ? bandColor(x.band) : "var(--color-text-tertiary)" }}
            >
              {x.band != null ? x.band.toFixed(1) : "—"}
            </div>
          </button>
        ))}
      </div>

      {/* Per-criteria weighted averages */}
      {per_criteria_avg && (
        <div
          className="rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3"
          style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}
        >
          {([
            { k: "task",      label: "Task Response" },
            { k: "coherence", label: "Coherence" },
            { k: "lexical",   label: "Lexical" },
            { k: "grammar",   label: "Grammar" },
          ] as const).map((c) => (
            <div key={c.k} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
                {c.label}
              </span>
              <span className="text-xl font-bold" style={{ color: bandColor(per_criteria_avg[c.k]) }}>
                {per_criteria_avg[c.k].toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab toggle: overview / task1 / task2 */}
      <div
        className="flex rounded-xl overflow-hidden"
        style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}
      >
        {([
          { key: "overview", label: "Tổng quan" },
          { key: "task1",    label: "Task 1" },
          { key: "task2",    label: "Task 2" },
        ] as { key: "overview" | "task1" | "task2"; label: string }[]).map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className="flex-1 py-2.5 text-sm font-medium transition-all cursor-pointer"
              style={{
                background: active ? "var(--color-accent)" : "transparent",
                color: active ? "#fff" : "var(--color-text-secondary)",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          Chọn Task 1 hoặc Task 2 để xem toàn bộ feedback chi tiết — gạch chân lỗi, icon paragraph, gợi ý paraphrase, sample band 7+.
        </p>
      )}

      {activeTab === "task1" && task1_submission && (
        <WritingResult submission={task1_submission} onBack={() => setActiveTab("overview")} />
      )}
      {activeTab === "task1" && !task1_submission && (
        <p className="text-sm italic text-center py-8" style={{ color: "var(--color-text-tertiary)" }}>
          Không có bài Task 1 trong Full Test này.
        </p>
      )}

      {activeTab === "task2" && task2_submission && (
        <WritingResult submission={task2_submission} onBack={() => setActiveTab("overview")} />
      )}
      {activeTab === "task2" && !task2_submission && (
        <p className="text-sm italic text-center py-8" style={{ color: "var(--color-text-tertiary)" }}>
          Không có bài Task 2 trong Full Test này.
        </p>
      )}
    </div>
  );
}
