"use client";

import React, { useState, useEffect } from "react";
import type { EndSessionResult } from "@/lib/types";

interface ScenarioSummaryProps {
  result: EndSessionResult;
  onClose: () => void;
}

function scoreColor(score: number): string {
  if (score >= 80) return "#34D399";
  if (score >= 60) return "#fbbf24";
  return "#f87171";
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export default function ScenarioSummary({ result, onClose }: ScenarioSummaryProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const target = result.overallScore;
    const duration = 800;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [result.overallScore]);

  const subScores = [
    { label: "Fluency", value: result.fluency },
    { label: "Vocabulary", value: result.vocabulary },
    { label: "Grammar", value: result.grammar },
  ];

  return (
    <div
      style={{ background: "var(--color-bg)" }}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
    >
      <div className="max-w-xl mx-auto w-full px-5 py-8 flex flex-col gap-7">
        {/* Title */}
        <h2
          className="text-xl font-sora font-bold text-center"
          style={{ color: "var(--color-text)" }}
        >
          Session Complete!
        </h2>

        {/* Animated score circle */}
        <div className="flex justify-center">
          <div
            className="w-36 h-36 rounded-full flex items-center justify-center"
            style={{
              border: `4px solid ${scoreColor(result.overallScore)}`,
              background: "var(--color-bg-card)",
              boxShadow: `0 0 24px ${scoreColor(result.overallScore)}25`,
            }}
          >
            <div className="text-center">
              <div
                className="text-4xl font-bold"
                style={{ color: scoreColor(result.overallScore) }}
              >
                {animatedScore}
              </div>
              <div className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
                / 100
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="flex justify-center gap-8 text-center"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <div>
            <div className="text-lg font-bold" style={{ color: "var(--color-text)" }}>{result.turnCount}</div>
            <div className="text-[12px]">turns</div>
          </div>
          <div>
            <div className="text-lg font-bold" style={{ color: "var(--color-text)" }}>{result.wordCount}</div>
            <div className="text-[12px]">words</div>
          </div>
          <div>
            <div className="text-lg font-bold" style={{ color: "var(--color-text)" }}>{formatDuration(result.durationMs)}</div>
            <div className="text-[12px]">duration</div>
          </div>
        </div>

        {/* Sub-score bars */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}
        >
          {subScores.map((s) => (
            <div key={s.label}>
              <div className="flex justify-between mb-1.5">
                <span className="text-[13px] font-medium" style={{ color: "var(--color-text)" }}>{s.label}</span>
                <span className="text-[13px] font-bold" style={{ color: scoreColor(s.value) }}>{s.value}</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${s.value}%`, background: scoreColor(s.value) }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Coach feedback */}
        {result.coachFeedback && (
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}
          >
            <div className="text-[12px] font-bold mb-2.5" style={{ color: "var(--color-primary)" }}>
              Coach Feedback
            </div>
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--color-text)" }}>
              {result.coachFeedback}
            </p>
          </div>
        )}

        {/* Turn-by-turn tips */}
        {result.turnFeedback && result.turnFeedback.length > 0 && (
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}
          >
            <div className="text-[12px] font-bold mb-3" style={{ color: "var(--color-primary)" }}>
              Turn Tips
            </div>
            <div className="flex flex-col gap-3">
              {result.turnFeedback.map((tf, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
                    style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
                  >
                    {tf.turnIndex}
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    {tf.tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Done button */}
        <button
          onClick={onClose}
          style={{ background: "var(--color-primary)", color: "#fff" }}
          className="w-full py-3.5 rounded-xl font-semibold text-[15px] hover:opacity-90 transition-opacity"
        >
          Done
        </button>
      </div>
    </div>
  );
}
