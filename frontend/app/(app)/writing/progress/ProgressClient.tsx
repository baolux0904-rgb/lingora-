"use client";

/**
 * /writing/progress — user-facing dashboard for Writing improvement.
 *
 * Pulls together three existing backend endpoints:
 *   - GET /analytics/self-compare  → current vs prev-month avg
 *   - GET /analytics/trend         → time-series (rendered by WritingTrendChart)
 *   - GET /writing/history         → per-task-type submission counts
 *
 * Plus the Style F progress-context endpoint reused from the result
 * drawer: since that endpoint takes a submissionId we key it off the
 * user's most recent submission (the one whose history cell was just
 * returned). No submissions yet → skip Style F; the page still has
 * value with just the hero + trend.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { bandColor } from "@/lib/bandColors";
import {
  getWritingHistory,
  getWritingProgressContext,
  getWritingSelfCompare,
} from "@/lib/api";
import WritingTrendChart from "@/components/Writing/WritingTrendChart";
import type {
  WritingErrorType,
  WritingProgressContext,
  WritingSelfCompare,
  WritingSubmissionSummary,
} from "@/lib/types";

function errorTypeLabel(t: WritingErrorType | undefined): string {
  switch (t) {
    case "grammar":    return "Ngữ pháp";
    case "vocabulary": return "Từ vựng";
    case "coherence":  return "Liên kết";
    default:           return "Lỗi";
  }
}

function errorTypeColor(t: WritingErrorType | undefined): string {
  switch (t) {
    case "grammar":    return "#1B2B4B";
    case "vocabulary": return "#00A896";
    case "coherence":  return "#F07167";
    default:           return "var(--color-text-secondary)";
  }
}

export default function ProgressClient() {
  const [selfCompare, setSelfCompare] = useState<WritingSelfCompare | null>(null);
  const [history, setHistory] = useState<WritingSubmissionSummary[]>([]);
  const [progress, setProgress] = useState<WritingProgressContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [compare, hist] = await Promise.all([
          getWritingSelfCompare().catch(() => null),
          getWritingHistory(1, 50).catch(() => ({ submissions: [] as WritingSubmissionSummary[], page: 1, limit: 50 })),
        ]);
        if (cancelled) return;
        setSelfCompare(compare);
        setHistory(hist.submissions);

        // Fetch pattern context off the most recent submission.
        const latest = hist.submissions[0];
        if (latest) {
          try {
            const ctx = await getWritingProgressContext(latest.id);
            if (!cancelled) setProgress(ctx);
          } catch { /* missing context → degrade gracefully */ }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không tải được tiến độ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const task1Count = history.filter((s) => s.task_type === "task1").length;
  const task2Count = history.filter((s) => s.task_type === "task2").length;
  const currentAvg = selfCompare?.current_month_avg ?? null;
  const delta = selfCompare?.delta ?? null;

  return (
    <div
      className="min-h-dvh px-4 sm:px-8 py-10 max-w-4xl mx-auto flex flex-col gap-6"
      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <div>
        <Link
          href="/home"
          className="inline-flex items-center gap-1 text-sm mb-3 transition-colors"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <span aria-hidden>←</span> Về trang chính
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Tiến độ Writing</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Xu hướng band, so sánh tháng trước, và pattern lỗi lặp lại.
        </p>
      </div>

      {error && (
        <div className="rounded-lg px-4 py-2.5 text-sm" style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444" }}>
          {error}
        </div>
      )}

      {/* Hero: current avg band + delta vs last month */}
      <div
        className="rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4"
        style={{
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--surface-shadow)",
        }}
      >
        <div>
          <div className="text-xs uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
            Band trung bình tháng này
          </div>
          <div
            className="text-4xl font-bold mt-1"
            style={{ color: currentAvg != null ? bandColor(currentAvg) : "var(--color-text-tertiary)" }}
          >
            {currentAvg != null ? currentAvg.toFixed(1) : "—"}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
            {selfCompare?.submission_count_current ?? 0} bài
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
            So với tháng trước
          </div>
          <div
            className="text-3xl font-bold mt-1"
            style={{ color: delta == null ? "var(--color-text-tertiary)" : delta > 0 ? "#16A34A" : delta < 0 ? "#EF4444" : "var(--color-text-secondary)" }}
          >
            {delta == null ? "—" : (delta >= 0 ? "+" : "") + delta.toFixed(1)}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
            Tháng trước: {selfCompare?.previous_month_avg != null ? selfCompare.previous_month_avg.toFixed(1) : "—"}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
            Phân bổ task
          </div>
          <div className="flex items-end gap-3 mt-1">
            <div>
              <div className="text-2xl font-bold" style={{ color: "#00A896" }}>{task1Count}</div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>Task 1</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: "#F59E0B" }}>{task2Count}</div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>Task 2</div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend chart (reused) */}
      <WritingTrendChart />

      {/* Error patterns from progress-context */}
      {progress && !progress.insufficient_data && progress.patterns.length > 0 && (
        <div
          className="rounded-xl p-5 flex flex-col gap-3"
          style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", boxShadow: "var(--surface-shadow)" }}
        >
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
            Pattern lỗi lặp lại
          </div>
          <div className="flex flex-col gap-2">
            {progress.patterns.map((p, i) => {
              const color = p.pattern_type === "error_type" ? errorTypeColor(p.error_type) : "#7E4EC1";
              const label = p.pattern_type === "error_type" ? errorTypeLabel(p.error_type) : "Issue lặp lại";
              return (
                <div
                  key={i}
                  className="rounded-lg p-3 flex flex-col gap-1"
                  style={{ background: "var(--color-bg-secondary)", borderLeft: `3px solid ${color}` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ background: `${color}15`, color }}
                    >
                      {label}
                    </span>
                    <span className="text-xs font-semibold">{p.occurrences} bài</span>
                  </div>
                  {p.example_issue && (
                    <p className="text-sm" style={{ color: "var(--color-text)" }}>
                      “{p.example_issue}”
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {progress?.insufficient_data && (
        <div
          className="rounded-xl p-5 text-center text-sm"
          style={{ background: "var(--color-bg-secondary)", color: "var(--color-text-secondary)", border: "1px dashed var(--color-border)" }}
        >
          Hoàn thành thêm bài viết để thấy pattern lỗi lặp lại (cần ≥10 bài, hiện có {progress.sample_size}).
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/home?tab=writing"
          className="px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, #00A896, #00C4B0)", color: "#fff" }}
        >
          Luyện Writing
        </Link>
        <Link
          href="/home?tab=writing&phase=history"
          className="px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "var(--color-bg-card)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
        >
          Xem lịch sử
        </Link>
      </div>

      {loading && !selfCompare && !history.length && (
        <div className="text-sm text-center py-6" style={{ color: "var(--color-text-tertiary)" }}>
          Đang tải dữ liệu…
        </div>
      )}
    </div>
  );
}
