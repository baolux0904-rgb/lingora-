"use client";

/**
 * ScenarioSummary.tsx
 *
 * Post-conversation summary screen with animated score circle,
 * sub-scores, coach feedback, and per-turn tips.
 */

import React, { useState, useEffect } from "react";
import type { EndSessionResult } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────

interface ScenarioSummaryProps {
  result: EndSessionResult;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 80) return "#4ade80";
  if (score >= 60) return "#fbbf24";
  return "#f87171";
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

// ─── Component ────────────────────────────────────────────────────────

export default function ScenarioSummary({
  result,
  onClose,
}: ScenarioSummaryProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score from 0 to target
  useEffect(() => {
    const target = result.overallScore;
    const duration = 800;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
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
      <div className="max-w-lg mx-auto w-full px-4 py-8 flex flex-col gap-6">
        {/* Title */}
        <h2
          className="text-xl font-sora font-bold text-center"
          style={{ color: "var(--color-text)" }}
        >
          Session Complete! 🎉
        </h2>

        {/* Animated score circle */}
        <div className="flex justify-center">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center"
            style={{
              border: `4px solid ${scoreColor(result.overallScore)}`,
              background: "var(--color-bg-card)",
            }}
          >
            <div className="text-center">
              <div
                className="text-3xl font-bold"
                style={{ color: scoreColor(result.overallScore) }}
              >
                {animatedScore}
              </div>
              <div
                className="text-xs"
                style={{ color: "var(--color-text-secondary)" }}
              >
                / 100
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="flex justify-center gap-6 text-center"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <div>
            <div
              className="text-lg font-bold"
              style={{ color: "var(--color-text)" }}
            >
              {result.turnCount}
            </div>
            <div className="text-xs">turns</div>
          </div>
          <div>
            <div
              className="text-lg font-bold"
              style={{ color: "var(--color-text)" }}
            >
              {result.wordCount}
            </div>
            <div className="text-xs">words</div>
          </div>
          <div>
            <div
              className="text-lg font-bold"
              style={{ color: "var(--color-text)" }}
            >
              {formatDuration(result.durationMs)}
            </div>
            <div className="text-xs">duration</div>
          </div>
        </div>

        {/* Sub-score bars */}
        <div
          className="rounded-xl p-4 flex flex-col gap-3"
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          {subScores.map((s) => (
            <div key={s.label}>
              <div className="flex justify-between mb-1">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  {s.label}
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: scoreColor(s.value) }}
                >
                  {s.value}
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: "var(--color-border)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${s.value}%`,
                    background: scoreColor(s.value),
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Coach feedback */}
        {result.coachFeedback && (
          <div
            className="rounded-xl p-4"
            style={{
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="text-xs font-semibold mb-2"
              style={{ color: "var(--color-primary)" }}
            >
              🧑‍🏫 Coach Feedback
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text)" }}
            >
              {result.coachFeedback}
            </p>
          </div>
        )}

        {/* Turn-by-turn tips */}
        {result.turnFeedback && result.turnFeedback.length > 0 && (
          <div
            className="rounded-xl p-4"
            style={{
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div
              className="text-xs font-semibold mb-3"
              style={{ color: "var(--color-primary)" }}
            >
              💡 Turn Tips
            </div>
            <div className="flex flex-col gap-2">
              {result.turnFeedback.map((tf, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                    style={{
                      background: "var(--color-primary-soft)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {tf.turnIndex}
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
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
          style={{
            background: "var(--color-primary)",
            color: "#fff",
          }}
          className="w-full py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Done
        </button>
      </div>
    </div>
  );
}
