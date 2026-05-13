"use client";

/**
 * FullTestResultPage — composes v2 result atoms for a Full Test (T1 + T2).
 *
 * Source: getWritingFullTest(fullTestId) → WritingFullTestDetail.
 * Polls while either task submission is still scoring.
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
import { getWritingFullTest } from "@/lib/api";
import type { WritingFullTestDetail, WritingSubmission } from "@/lib/types";

const POLL_INTERVAL_MS = 2500;
const POLL_CEILING_MS = 120_000; // 2 min — Full Test scores 2 essays

interface FullTestResultPageProps {
  fullTestId: string;
}

function isFinalSubmission(s: WritingSubmission | null): boolean {
  if (!s) return true;
  return s.status === "completed" || s.status === "failed";
}

function TaskSection({
  title,
  submission,
}: {
  title: string;
  submission: WritingSubmission | null;
}) {
  if (!submission) return null;
  const fb = submission.feedback_json;
  return (
    <section className="mt-10">
      <h2
        className="font-display italic text-[24px] sm:text-[28px] leading-tight mb-6"
        style={{ color: "var(--color-text)" }}
      >
        {title}
      </h2>
      <SubBandGrid
        task={submission.task_score}
        coherence={submission.coherence_score}
        lexical={submission.lexical_score}
        grammar={submission.grammar_score}
      />
      {fb &&
      (fb.strengths?.length ||
        fb.weaknesses?.length ||
        fb.improvements?.length ||
        fb.top_3_priorities?.length) ? (
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
        <ComparisonSampleCard
          sampleEssay={fb.sample_essay}
          currentBand={submission.overall_band}
        />
      )}
    </section>
  );
}

export default function FullTestResultPage({ fullTestId }: FullTestResultPageProps) {
  const [detail, setDetail] = useState<WritingFullTestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const startedAtRef = useRef<number>(Date.now());

  const fetchDetail = useCallback(async () => {
    try {
      const res = await getWritingFullTest(fullTestId);
      setDetail(res);
      const bothFinal =
        isFinalSubmission(res.task1_submission) &&
        isFinalSubmission(res.task2_submission);
      if (bothFinal) setLoading(false);
      return res;
    } catch {
      setError(true);
      setLoading(false);
      return null;
    }
  }, [fullTestId]);

  useEffect(() => {
    startedAtRef.current = Date.now();
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      if (cancelled) return;
      const res = await fetchDetail();
      if (cancelled) return;
      if (!res) return;
      const bothFinal =
        isFinalSubmission(res.task1_submission) &&
        isFinalSubmission(res.task2_submission);
      const overCeiling = Date.now() - startedAtRef.current > POLL_CEILING_MS;
      if (!bothFinal && !overCeiling) {
        timer = setTimeout(tick, POLL_INTERVAL_MS);
      } else if (!bothFinal && overCeiling) {
        setError(true);
        setLoading(false);
      }
    }

    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [fetchDetail]);

  if (loading) return <LoadingState />;
  if (error || !detail) {
    return (
      <ErrorState
        message="Có lỗi xảy ra khi chấm bài thi. Thử lại sau nhé."
        onRetry={() => {
          setError(false);
          setLoading(true);
          startedAtRef.current = Date.now();
          fetchDetail();
        }}
      />
    );
  }

  const scoredAt =
    detail.full_test.submitted_at ?? detail.full_test.started_at;

  return (
    <main className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-[960px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-medium mb-6">
          <Link
            href="/exam/writing/full-test"
            className="inline-flex items-center gap-1 transition-colors hover:text-teal"
            style={{ color: "#5DCAA5" }}
          >
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
            Full Test
          </Link>
          <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
          <span style={{ color: "var(--color-text-tertiary)" }}>Kết quả</span>
        </nav>

        <BandScoreReveal
          band={detail.overall_band}
          scoredAt={scoredAt}
          trend={null}
        />

        <div
          className="border-t my-4"
          style={{ borderColor: "rgba(229,220,198,0.16)" }}
          aria-hidden="true"
        />

        {detail.per_criteria_avg && (
          <SubBandGrid
            task={detail.per_criteria_avg.task}
            coherence={detail.per_criteria_avg.coherence}
            lexical={detail.per_criteria_avg.lexical}
            grammar={detail.per_criteria_avg.grammar}
          />
        )}

        <div
          className="border-t my-8"
          style={{ borderColor: "rgba(229,220,198,0.16)" }}
          aria-hidden="true"
        />

        <TaskSection title="Task 1" submission={detail.task1_submission} />

        <div
          className="border-t my-12"
          style={{ borderColor: "rgba(229,220,198,0.16)" }}
          aria-hidden="true"
        />

        <TaskSection title="Task 2" submission={detail.task2_submission} />

        {/* CTAs */}
        <div className="flex gap-3 mt-16 flex-wrap">
          <Link
            href="/exam/writing/full-test"
            className="inline-flex items-center justify-center bg-teal text-cream rounded-full px-7 py-3 text-[14px] font-medium hover:bg-teal-dark transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
          >
            Thi lần khác →
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
