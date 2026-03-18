"use client";

import type { FocusRecommendation, FocusType } from "@/lib/types";

const LABEL_STYLES: Record<FocusType, { bg: string; color: string }> = {
  first_lesson:  { bg: "rgba(74,222,128,0.12)",    color: "#34D399"   },
  pronunciation: { bg: "rgba(245,158,11,0.12)",     color: "#f59e0b"   },
  scenario:      { bg: "rgba(124,92,252,0.12)",     color: "var(--color-primary)" },
  ielts:         { bg: "rgba(167,139,250,0.12)",    color: "#a78bfa"   },
};

function LabelPill({ type, label }: { type: FocusType; label: string }) {
  const style = LABEL_STYLES[type] ?? LABEL_STYLES.scenario;
  return (
    <span
      className="inline-block text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-0.5"
      style={{ background: style.bg, color: style.color }}
    >
      {label}
    </span>
  );
}

function RecommendationRow({
  rec,
  onAction,
}: {
  rec:      FocusRecommendation;
  onAction: (rec: FocusRecommendation) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <LabelPill type={rec.type} label={rec.label} />
        <p
          className="text-[15px] font-semibold leading-snug"
          style={{ color: "var(--color-text)" }}
        >
          {rec.title}
        </p>
        <p
          className="text-[13px] leading-snug"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {rec.description}
        </p>
      </div>

      <button
        onClick={() => onAction(rec)}
        className="shrink-0 flex items-center gap-1 text-[13px] font-semibold rounded-xl px-4 py-2 transition-all active:scale-95"
        style={{
          background: "var(--color-primary)",
          color:      "#fff",
        }}
      >
        {rec.actionLabel}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 5h6M6 3l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

interface TodayFocusCardProps {
  recommendations: FocusRecommendation[];
  loading:         boolean;
  onAction:        (rec: FocusRecommendation) => void;
}

export default function TodayFocusCard({
  recommendations,
  loading,
  onAction,
}: TodayFocusCardProps) {
  if (loading) return null;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: "var(--color-bg-card)",
        border:     "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="text-lg leading-none">🎯</span>
        <h2
          className="text-[15px] font-semibold font-sora"
          style={{ color: "var(--color-text)" }}
        >
          Today&apos;s Focus
        </h2>
      </div>

      {recommendations.length === 0 && (
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          You&apos;re doing great today! Keep practicing to maintain your streak.
        </p>
      )}

      {recommendations.map((rec, i) => (
        <div key={rec.type}>
          {i > 0 && (
            <div
              className="h-px mb-4"
              style={{ background: "var(--color-border)" }}
            />
          )}
          <RecommendationRow rec={rec} onAction={onAction} />
        </div>
      ))}
    </div>
  );
}
