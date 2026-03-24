"use client";

/**
 * CompletionScreen.tsx
 *
 * Reward moment after completing a lesson.
 * Shows: XP earned (animated), score cards, streak, daily goal progress,
 * positive feedback, and forward-momentum actions (Next Lesson / Done).
 *
 * All new props are optional — backward compatible with callers that
 * don't pass daily goal or next lesson info.
 */

import { useEffect, useState } from "react";

interface CompletionScreenProps {
  lessonTitle:    string;
  xpEarned:       number;
  quizScore:      number;
  speakingScore?: number;
  streak?:        number;
  onClose:        () => void;
  /** Optional: show "Next Lesson" button when there's a next lesson available. */
  nextLessonTitle?: string;
  onNextLesson?:   () => void;
  /** Optional: daily goal progress after this completion. */
  dailyXp?:        number;
  dailyGoal?:      number;
}

export default function CompletionScreen({
  lessonTitle,
  xpEarned,
  quizScore,
  speakingScore,
  streak,
  onClose,
  nextLessonTitle,
  onNextLesson,
  dailyXp,
  dailyGoal,
}: CompletionScreenProps) {
  const [show, setShow] = useState(false);
  const [xpAnimated, setXpAnimated] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 50);
    const t2 = setTimeout(() => setXpAnimated(true), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Determine highlight message
  const bestScore = Math.max(quizScore, speakingScore ?? 0);
  const highlight =
    bestScore >= 90 ? "Perfect!" :
    bestScore >= 80 ? "Great job!" :
    bestScore >= 60 ? "Nice work!" :
    "Keep going!";

  const focusArea =
    speakingScore != null && speakingScore < quizScore
      ? "Focus on speaking practice next time"
      : quizScore < (speakingScore ?? 100)
      ? "Review vocabulary and grammar"
      : "You're well-rounded — keep it up!";

  // Daily goal
  const hasDailyGoal = dailyXp != null && dailyGoal != null && dailyGoal > 0;
  const dailyPct = hasDailyGoal ? Math.min(100, Math.round((dailyXp! / dailyGoal!) * 100)) : 0;
  const dailyGoalMet = hasDailyGoal && dailyXp! >= dailyGoal!;

  return (
    <div
      className="flex flex-col items-center gap-4 py-4 transition-all duration-500"
      style={{ opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(12px)" }}
    >
      {/* Trophy */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
        style={{
          background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
          boxShadow: "0 0 32px var(--color-primary-glow)",
        }}
      >
        {bestScore >= 90 ? "\u{1F31F}" : "\u{1F3C6}"}
      </div>

      {/* Headline */}
      <div className="text-center">
        <p className="text-[20px] font-sora font-bold" style={{ color: "var(--color-text)" }}>
          {highlight}
        </p>
        <p className="text-[13px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
          {lessonTitle}
        </p>
      </div>

      {/* ── XP Earned — hero stat ── */}
      {xpEarned > 0 && (
        <div
          className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-500"
          style={{
            background: xpAnimated
              ? "linear-gradient(135deg, rgba(46,211,198,0.15), rgba(45,168,255,0.1))"
              : "transparent",
            border: "1px solid rgba(46,211,198,0.25)",
            transform: xpAnimated ? "scale(1)" : "scale(0.9)",
            opacity: xpAnimated ? 1 : 0,
          }}
        >
          <span className="text-[20px] font-sora font-bold" style={{ color: "var(--color-success)" }}>
            +{xpEarned} XP
          </span>
          {bestScore >= 100 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
              Perfect bonus!
            </span>
          )}
        </div>
      )}

      {/* ── Score cards row ── */}
      <div className="flex gap-2.5 w-full max-w-[300px]">
        {quizScore > 0 && (
          <div
            className="flex-1 rounded-xl p-3.5 text-center"
            style={{
              backgroundColor: "var(--color-primary-soft)",
              border: "1px solid var(--color-primary-glow)",
            }}
          >
            <p className="text-[22px] font-bold" style={{ color: "var(--color-primary)" }}>{quizScore}%</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-secondary)" }}>Quiz</p>
          </div>
        )}
        {speakingScore != null && speakingScore > 0 && (
          <div
            className="flex-1 rounded-xl p-3.5 text-center"
            style={{
              backgroundColor: "var(--color-primary-soft)",
              border: "1px solid var(--color-primary-glow)",
            }}
          >
            <p className="text-[22px] font-bold" style={{ color: "var(--color-accent)" }}>{speakingScore}%</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-secondary)" }}>Speaking</p>
          </div>
        )}
        {streak != null && streak > 0 && (
          <div
            className="flex-1 rounded-xl p-3.5 text-center"
            style={{
              backgroundColor: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.2)",
            }}
          >
            <p className="text-[22px] font-bold text-amber-400">
              {"\u{1F525}"} {streak}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
              Day streak
            </p>
          </div>
        )}
      </div>

      {/* ── Daily Goal progress ── */}
      {hasDailyGoal && (
        <div className="w-full max-w-[300px]">
          <div
            className="rounded-xl px-4 py-3"
            style={{
              border: dailyGoalMet
                ? "1px solid rgba(251,191,36,0.25)"
                : "1px solid var(--color-border)",
              background: dailyGoalMet
                ? "rgba(251,191,36,0.06)"
                : "var(--color-primary-soft)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                Daily Goal
              </span>
              <span
                className="text-[11px] font-bold"
                style={{ color: dailyGoalMet ? "#F59E0B" : "var(--color-text-secondary)" }}
              >
                {dailyXp} / {dailyGoal} XP
                {dailyGoalMet && " \u2713"}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-border)" }}>
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${dailyPct}%`,
                  background: dailyGoalMet
                    ? "linear-gradient(90deg, #F59E0B, #D97706)"
                    : "linear-gradient(90deg, var(--color-success), var(--color-accent))",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Focus area */}
      <p className="text-[12px] text-center px-4" style={{ color: "var(--color-text-secondary)" }}>
        {focusArea}
      </p>

      {/* ── Actions ── */}
      <div className="flex flex-col gap-2.5 w-full max-w-[300px]">
        {onNextLesson && nextLessonTitle && (
          <button
            onClick={onNextLesson}
            className="w-full py-3 rounded-xl font-semibold text-[14px] text-white transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
            }}
          >
            Next: {nextLessonTitle.length > 24 ? nextLessonTitle.slice(0, 24) + "..." : nextLessonTitle}
            <span style={{ fontSize: 16 }}>&rarr;</span>
          </button>
        )}
        <button
          onClick={onClose}
          className={`w-full py-3 rounded-xl font-semibold text-[14px] transition-all duration-200 hover:opacity-90 ${onNextLesson ? "" : "text-white"}`}
          style={
            onNextLesson
              ? {
                  background: "var(--color-primary-soft)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-secondary)",
                }
              : {
                  background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
                  color: "white",
                }
          }
        >
          {onNextLesson ? "Back to Practice" : "Done"}
        </button>
      </div>
    </div>
  );
}
