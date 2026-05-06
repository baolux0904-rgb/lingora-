"use client";

/**
 * WritingHistory.tsx — Lists past writing submissions.
 * Each row shows task type, band score, date, and status badge.
 *
 * Wave 6 Sprint 5C.1e — restyled to cream canon (bg-cream-warm,
 * border-navy/10, text-navy / text-navy-light, font-display Playfair
 * for prominent band score, font-sans DM Sans body) matching
 * WritingResult + WritingPromptSelector palette.
 */

import { useEffect, useState, useCallback } from "react";
import { getWritingHistory } from "@/lib/api";
import Skeleton from "@/components/ui/Skeleton";
import WritingTrendChart from "./WritingTrendChart";
import { bandColor } from "@/lib/bandColors";
import type { WritingSubmissionSummary } from "@/lib/types";

interface WritingHistoryProps {
  onSelect: (submissionId: string) => void;
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    completed: { bg: "rgba(34,197,94,0.12)", color: "#22C55E", label: "Scored" },
    pending:   { bg: "rgba(245,158,11,0.12)", color: "#F59E0B", label: "Pending" },
    failed:    { bg: "rgba(239,68,68,0.12)", color: "#EF4444", label: "Failed" },
  }[status] ?? { bg: "rgba(156,163,175,0.12)", color: "#9CA3AF", label: status };

  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-medium font-sans"
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}

export default function WritingHistory({ onSelect }: WritingHistoryProps) {
  const [submissions, setSubmissions] = useState<WritingSubmissionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getWritingHistory(1, 20);
      setSubmissions(result.submissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <Skeleton.List count={3} />
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 font-sans">
        <p className="text-sm text-navy-light">{error}</p>
        <button onClick={load} className="text-sm mt-2 font-medium text-teal hover:text-teal-dark transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 font-sans">
        <p className="text-sm text-navy-light/70">
          No submissions yet. Write your first essay!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <WritingTrendChart />

      <div className="flex flex-col gap-2">
      {submissions.map((sub) => {
        const band = sub.overall_band != null ? Number(sub.overall_band) : null;
        return (
        <button
          key={sub.id}
          onClick={() => onSelect(sub.id)}
          className="flex items-center gap-3 p-3.5 rounded-lg text-left transition-all hover:shadow-sm bg-cream-warm border border-navy/10 hover:border-teal/30"
        >
          {/* Task type badge */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold font-sans"
            style={{
              background: sub.task_type === "task1" ? "rgba(0,168,150,0.10)" : "rgba(245,158,11,0.10)",
              color: sub.task_type === "task1" ? "#00A896" : "#F59E0B",
            }}
          >
            {sub.task_type === "task1" ? "T1" : "T2"}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 font-sans">
            <div className="text-sm font-medium truncate text-navy">
              {sub.question_text.slice(0, 60)}{sub.question_text.length > 60 ? "..." : ""}
            </div>
            <div className="text-xs mt-0.5 text-navy-light/70">
              {sub.word_count} words &middot; {new Date(sub.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Score or status — band score uses Playfair display + bandColor()
              per Sprint 5C.1b WritingResult pattern. Soul rule: never red. */}
          <div className="flex items-center gap-2 shrink-0">
            {sub.status === "completed" && band != null ? (
              <span
                className="font-display text-xl leading-none"
                style={{ color: bandColor(band) }}
              >
                {band.toFixed(1)}
              </span>
            ) : (
              <StatusBadge status={sub.status} />
            )}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-navy-light/70">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>
        );
      })}
      </div>
    </div>
  );
}
