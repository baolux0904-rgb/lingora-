"use client";

/**
 * AppDataContext.tsx
 *
 * Runs the shared data hooks ONCE at the (app) layout boundary and exposes
 * the results to every route inside the group. Because Next.js App Router
 * keeps the layout mounted across intra-group navigation, the underlying
 * hooks fire once per session — no SWR/React-Query needed for dedupe.
 *
 * Hooks lifted from the old /home god-component:
 *   useCurrentUserId, useProgress, useLessons, useUserStats, useGamification,
 *   useSpeakingMetrics, useTodayFocus, plus getBattleHome() for rank tier.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { useProgress } from "@/hooks/useProgress";
import { useLessons } from "@/hooks/useLessons";
import { useUserStats, type UserStats } from "@/hooks/useUserStats";
import { useGamification } from "@/hooks/useGamification";
import { useSpeakingMetrics } from "@/hooks/useSpeakingMetrics";
import { useTodayFocus } from "@/hooks/useTodayFocus";
import { getBattleHome } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/authStore";
import type {
  GamificationData,
  SpeakingMetricsData,
  FocusRecommendation,
  BattleRankTier,
} from "@/lib/types";

interface AppDataValue {
  userId: string | null;
  stats: UserStats;
  gamification: GamificationData | null;
  refetchGamification: () => void;
  speakingMetrics: SpeakingMetricsData | null;
  speakingMetricsLoading: boolean;
  focusRecs: FocusRecommendation[];
  focusLoading: boolean;
  rankTier: BattleRankTier;
  displayStreak: number;
}

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();
  const userId = useCurrentUserId();
  const { progress } = useProgress(userId);
  const { apiLessons } = useLessons();
  const stats = useUserStats(progress, apiLessons);
  const { data: gamification, refetch: refetchGamification } = useGamification(userId);
  const { data: speakingMetrics, loading: speakingMetricsLoading } = useSpeakingMetrics(userId);
  const { recommendations: focusRecs, loading: focusLoading } = useTodayFocus(userId);

  const [rankTier, setRankTier] = useState<BattleRankTier>("iron");
  useEffect(() => {
    if (!user) return;
    getBattleHome()
      .then((home) => {
        if (home?.profile?.current_rank_tier) setRankTier(home.profile.current_rank_tier);
      })
      .catch(() => {});
  }, [user]);

  const displayStreak = gamification?.streak.currentStreak ?? stats.streak;

  const value: AppDataValue = {
    userId,
    stats,
    gamification,
    refetchGamification,
    speakingMetrics,
    speakingMetricsLoading,
    focusRecs,
    focusLoading,
    rankTier,
    displayStreak,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData must be used inside <AppDataProvider>");
  }
  return ctx;
}
