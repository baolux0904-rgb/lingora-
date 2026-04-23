"use client";

/**
 * WritingTrendChart — time-series of the user's Writing bands over
 * 7d / 30d / 90d. Three breakdowns:
 *   - overall   : one line (overall_band)
 *   - criteria  : four lines (Task, Coherence, Lexical, Grammar)
 *   - by_task   : two lines (Task 1, Task 2)
 *
 * Fetches GET /writing/analytics/trend on mount + whenever controls
 * change. Empty state shows a friendly nudge to start writing instead
 * of an empty chart box.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getWritingTrend } from "@/lib/api";
import type {
  WritingTrendBreakdown,
  WritingTrendPoint,
  WritingTrendRange,
} from "@/lib/types";

const RANGE_OPTIONS: { key: WritingTrendRange; label: string }[] = [
  { key: "7d", label: "7 ngày" },
  { key: "30d", label: "30 ngày" },
  { key: "90d", label: "90 ngày" },
];

const BREAKDOWN_OPTIONS: { key: WritingTrendBreakdown; label: string }[] = [
  { key: "overall",  label: "Overall" },
  { key: "criteria", label: "4 tiêu chí" },
  { key: "by_task",  label: "Task 1 / 2" },
];

const PALETTE = ["#00A896", "#1B2B4B", "#F07167", "#F9A826", "#7E4EC1"];

interface SeriesDef {
  key: keyof WritingTrendPoint;
  label: string;
}

function seriesFor(breakdown: WritingTrendBreakdown): SeriesDef[] {
  switch (breakdown) {
    case "criteria":
      return [
        { key: "task_achievement", label: "Task Response" },
        { key: "coherence",        label: "Coherence" },
        { key: "lexical",          label: "Lexical" },
        { key: "grammar",          label: "Grammar" },
      ];
    case "by_task":
      return [
        { key: "task1_band", label: "Task 1" },
        { key: "task2_band", label: "Task 2" },
      ];
    case "overall":
    default:
      return [{ key: "overall_band", label: "Overall" }];
  }
}

export default function WritingTrendChart() {
  const [range, setRange] = useState<WritingTrendRange>("30d");
  const [breakdown, setBreakdown] = useState<WritingTrendBreakdown>("overall");
  const [points, setPoints] = useState<WritingTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getWritingTrend(range, breakdown);
      setPoints(res.points ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [range, breakdown]);

  useEffect(() => { void load(); }, [load]);

  const series = useMemo(() => seriesFor(breakdown), [breakdown]);

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--surface-shadow)",
      }}
    >
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
            Xu hướng band
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ border: "1px solid var(--color-border)", background: "var(--color-bg-secondary)" }}
          >
            {RANGE_OPTIONS.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className="px-2.5 py-1 text-xs font-medium transition-all cursor-pointer"
                style={{
                  background: range === r.key ? "var(--color-accent)" : "transparent",
                  color: range === r.key ? "#fff" : "var(--color-text-secondary)",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ border: "1px solid var(--color-border)", background: "var(--color-bg-secondary)" }}
          >
            {BREAKDOWN_OPTIONS.map((b) => (
              <button
                key={b.key}
                type="button"
                onClick={() => setBreakdown(b.key)}
                className="px-2.5 py-1 text-xs font-medium transition-all cursor-pointer"
                style={{
                  background: breakdown === b.key ? "#1B2B4B" : "transparent",
                  color: breakdown === b.key ? "#fff" : "var(--color-text-secondary)",
                }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart area */}
      {error && (
        <div className="text-sm rounded-lg px-3 py-2" style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444" }}>
          {error}
        </div>
      )}

      {!error && loading && (
        <div className="h-64 flex items-center justify-center">
          <div
            className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
          />
        </div>
      )}

      {!error && !loading && points.length === 0 && (
        <div
          className="h-64 flex items-center justify-center text-sm text-center px-4"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Chưa có dữ liệu cho khoảng thời gian này. Viết thêm một bài để thấy xu hướng.
        </div>
      )}

      {!error && !loading && points.length > 0 && (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={points} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 9]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {series.map((s, i) => (
              <Line
                key={String(s.key)}
                type="monotone"
                dataKey={s.key as string}
                name={s.label}
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
