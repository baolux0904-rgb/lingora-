"use client";

/**
 * PracticeResultPage — composes v2 result atoms for a single-essay
 * Practice submission.
 *
 * Fetches in parallel:
 *   - getWritingResult(submissionId) → submission + feedback_json
 *   - getWritingHistory({ page: 1, limit: 2 }) → trend delta source
 *
 * Polls `getWritingResult` while status === "pending" (3x multi-sampling
 * takes 15-30s typically). Stops polling on success or after a hard
 * 90-second ceiling.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import BandScoreReveal from "./BandScoreReveal";
import SubBandGrid from "./SubBandGrid";
import AIFeedbackProse from "./AIFeedbackProse";
import HighlightedEssay from "./HighlightedEssay";
import ComparisonSampleCard from "./ComparisonSampleCard";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import { formatTrendDelta, type TrendDelta } from "./utils/formatTrendDelta";
import { getWritingResult, getWritingHistory } from "@/lib/api";
import type { WritingSubmission } from "@/lib/types";

const POLL_INTERVAL_MS = 2500;
const POLL_CEILING_MS = 90_000;

interface PracticeResultPageProps {
  submissionId: string;
}

export default function PracticeResultPage({ submissionId }: PracticeResultPageProps) {
  const [submission, setSubmission] = useState<WritingSubmission | null>(null);
  const [trend, setTrend] = useState<TrendDelta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const startedAtRef = useRef<number>(Date.now());

  const fetchAll = useCallback(async () => {
    try {
      const [res, hist] = await Promise.all([
        getWritingResult(submissionId),
        getWritingHistory(1, 2).catch(() => null),
      ]);
      setSubmission(res);
      if (res.status === "completed" || res.status === "failed") {
        setTrend(
          formatTrendDelta(res.overall_band, res.id, hist?.submissions ?? null),
        );
        setLoading(false);
      }
      return res;
    } catch {
      setError(true);
      setLoading(false);
      return null;
    }
  }, [submissionId]);

  useEffect(() => {
    startedAtRef.current = Date.now();
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      if (cancelled) return;
      const res = await fetchAll();
      if (cancelled) return;
      if (!res) return;
      const isTerminal = res.status === "completed" || res.status === "failed";
      const overCeiling = Date.now() - startedAtRef.current > POLL_CEILING_MS;
      if (!isTerminal && !overCeiling) {
        timer = setTimeout(tick, POLL_INTERVAL_MS);
      } else if (!isTerminal && overCeiling) {
        // Timed out waiting for scoring — surface as error.
        setError(true);
        setLoading(false);
      }
    }

    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [fetchAll]);

  if (loading) return <LoadingState />;
  if (error || !submission || submission.status === "failed") {
    return (
      <ErrorState
        message="Có lỗi xảy ra khi chấm bài. Thử nộp lại sau nhé."
        onRetry={() => {
          setError(false);
          setLoading(true);
          startedAtRef.current = Date.now();
          fetchAll();
        }}
      />
    );
  }

  const fb = submission.feedback_json;

  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-[960px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-medium mb-6">
          <Link
            href="/exam/writing/practice"
            className="inline-flex items-center gap-1 transition-colors hover:text-teal"
            style={{ color: "#5DCAA5" }}
          >
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
            Luyện tập
          </Link>
          <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
          <span style={{ color: "var(--color-text-tertiary)" }}>Bài đã chấm</span>
        </nav>

        <BandScoreReveal
          band={submission.overall_band}
          scoredAt={submission.updated_at || submission.created_at}
          trend={trend}
        />

        <div
          className="border-t my-4"
          style={{ borderColor: "rgba(229,220,198,0.16)" }}
          aria-hidden="true"
        />

        <SubBandGrid
          task={submission.task_score}
          coherence={submission.coherence_score}
          lexical={submission.lexical_score}
          grammar={submission.grammar_score}
        />

        {fb && (fb.strengths?.length || fb.weaknesses?.length || fb.improvements?.length || fb.top_3_priorities?.length) ? (
          <>
            <div
              className="border-t my-4"
              style={{ borderColor: "rgba(229,220,198,0.16)" }}
              aria-hidden="true"
            />
            <AIFeedbackProse
              strengths={fb.strengths}
              weaknesses={fb.weaknesses}
              improvements={fb.improvements}
              topPriorities={fb.top_3_priorities}
            />
          </>
        ) : null}

        <div
          className="border-t my-4"
          style={{ borderColor: "rgba(229,220,198,0.16)" }}
          aria-hidden="true"
        />

        <HighlightedEssay
          essayText={submission.essay_text}
          corrections={fb?.sentence_corrections}
          wordCount={submission.word_count}
        />

        {fb?.sample_essay && (
          <>
            <div
              className="border-t my-4"
              style={{ borderColor: "rgba(229,220,198,0.16)" }}
              aria-hidden="true"
            />
            <ComparisonSampleCard
              sampleEssay={fb.sample_essay}
              currentBand={submission.overall_band}
            />
          </>
        )}

        {/* CTAs */}
        <div className="flex gap-3 mt-12 flex-wrap">
          <Link
            href="/exam/writing/practice"
            className="inline-flex items-center justify-center bg-teal text-cream rounded-full px-7 py-3 text-[14px] font-medium hover:bg-teal-dark transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
          >
            Viết bài khác →
          </Link>
          <Link
            href="/writing/history"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-[14px] font-medium transition-colors duration-fast hover:bg-[var(--color-bg-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
            style={{
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
          >
            Xem lịch sử
          </Link>
        </div>
      </div>
    </main>
  );
}
