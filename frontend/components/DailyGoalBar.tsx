"use client";

/**
 * DailyGoalBar.tsx
 *
 * Compact daily XP goal progress bar for the Practice tab.
 * Shows: "12 / 20 XP today" with animated fill and streak count.
 * Celebrates when daily goal is met.
 */

import { useEffect, useState } from "react";
import { IconFire, IconZap } from "./Icons";
import type { DailyGoalState } from "@/hooks/useDailyGoal";

interface DailyGoalBarProps {
  goal: DailyGoalState;
  streak: number;
}

export default function DailyGoalBar({ goal, streak }: DailyGoalBarProps) {
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPct(goal.progressPct), 100);
    return () => clearTimeout(timer);
  }, [goal.progressPct]);

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        border: goal.goalMet
          ? "1px solid rgba(251,191,36,0.25)"
          : "1px solid var(--color-border)",
        background: goal.goalMet
          ? "linear-gradient(135deg, rgba(251,191,36,0.06), rgba(245,158,11,0.04))"
          : "var(--color-bg-card)",
      }}
    >
      {/* Top row — daily XP + streak */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: goal.goalMet
                ? "linear-gradient(135deg, #F59E0B, #D97706)"
                : "rgba(46,211,198,0.12)",
            }}
          >
            <IconZap size={14} className={goal.goalMet ? "text-white" : "text-emerald-400"} />
          </div>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "var(--color-text)" }}>
              {goal.goalMet ? "Daily goal reached!" : "Daily Goal"}
            </p>
            <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
              {goal.todayXp} / {goal.dailyGoal} XP today
              {goal.todayLessons > 0 && ` · ${goal.todayLessons} lesson${goal.todayLessons !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Streak badge */}
        {streak > 0 && (
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{
              backgroundColor: "rgba(251,191,36,0.1)",
              border: "1px solid rgba(251,191,36,0.18)",
              color: "#F59E0B",
            }}
          >
            <IconFire size={12} className="text-amber-400" />
            {streak}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-border)" }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${animatedPct}%`,
            background: goal.goalMet
              ? "linear-gradient(90deg, #F59E0B, #D97706)"
              : "linear-gradient(90deg, var(--color-success), var(--color-accent))",
            boxShadow: goal.goalMet ? "0 0 8px rgba(245,158,11,0.4)" : undefined,
          }}
        />
      </div>
    </div>
  );
}
