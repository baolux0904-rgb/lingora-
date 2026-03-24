/**
 * hooks/useDailyGoal.ts
 *
 * Pure frontend computation of daily XP goal progress.
 * Derives today's XP from the progress array (completed lessons today × XP_PER_LESSON).
 * No API calls, no localStorage — recomputed on every render from source data.
 *
 * Daily reset is automatic: filters by today's date, so tomorrow returns 0.
 */

"use client";

import { useMemo } from "react";
import type { ApiProgressItem } from "@/lib/api";

// ─── Constants ─────────────────────────────────────────────────────────────

/** XP awarded per lesson completion — matches backend XP_PER_LESSON */
const XP_PER_LESSON = 10;

/** XP bonus for perfect score (100%) */
const PERFECT_BONUS = 5;

/** Daily XP target — achievable with ~2 lessons */
const DAILY_XP_GOAL = 20;

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Date key for comparison — matches useUserStats.dateKey() */
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// ─── Types ─────────────────────────────────────────────────────────────────

export interface DailyGoalState {
  /** XP earned today */
  todayXp: number;
  /** Daily XP target */
  dailyGoal: number;
  /** Lessons completed today */
  todayLessons: number;
  /** Whether daily goal is met */
  goalMet: boolean;
  /** Progress percentage (0-100, capped at 100) */
  progressPct: number;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

/**
 * Compute daily goal progress from the user's progress data.
 * Pure computation — no side effects, no API calls.
 */
export function useDailyGoal(progress: ApiProgressItem[]): DailyGoalState {
  return useMemo(() => {
    const todayStr = dateKey(new Date());

    const todayCompleted = progress.filter((p) => {
      if (!p.completed || !p.completedAt) return false;
      return dateKey(new Date(p.completedAt)) === todayStr;
    });

    const todayLessons = todayCompleted.length;

    // Base XP + perfect bonus
    const todayXp = todayCompleted.reduce((sum, p) => {
      const base = XP_PER_LESSON;
      const bonus = p.score >= 100 ? PERFECT_BONUS : 0;
      return sum + base + bonus;
    }, 0);

    const goalMet = todayXp >= DAILY_XP_GOAL;
    const progressPct = Math.min(100, Math.round((todayXp / DAILY_XP_GOAL) * 100));

    return { todayXp, dailyGoal: DAILY_XP_GOAL, todayLessons, goalMet, progressPct };
  }, [progress]);
}
