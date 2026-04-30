"use client";

/**
 * DailyMissionPanel.tsx — DECORATIVE pre-launch (Wave 5.4.3 audit).
 *
 * Status today (verified by Phase 1 discovery):
 *   - Panel renders the 3-mission catalog (hardcoded in DAILY_MISSIONS).
 *   - `xp_50` progress is auto-derived from gamification.xp.xpInLevel.
 *   - `speak_1` / `battle_1` progress is NEVER incremented in practice
 *     — `incrementMission` is exported but has 0 callers in the
 *     codebase. Speaking/Battle completion handlers do not wire it.
 *   - `fireXP(50, "mission")` is a client-only animation via
 *     RewardContext. It does NOT write to xp_ledger; per-mission
 *     `rewardXp` (20/30/25) is decorative — no real XP is granted.
 *
 * No XP exploit exists: the localStorage flags (removed in 5.4.3)
 * only gated repeat-animation, not any real XP grant.
 *
 * Wave 6 plan (when this is revived as a real feature):
 *   - Migration: `daily_mission_claims` with
 *     UNIQUE(user_id, mission_id, claim_date) where claim_date is
 *     the Asia/Ho_Chi_Minh day boundary (Wave 2.1 pattern).
 *   - BE: GET /daily-missions, POST /:missionId/progress (UPSERT),
 *     POST /:missionId/claim (transactional + xp_ledger emit).
 *   - Wire real progress sources: Speaking complete →
 *     incrementMission('speak_1'); Battle complete →
 *     incrementMission('battle_1'); XP delta hook for `xp_50`.
 *   - xp_ledger emit on claim: awardXp(userId, rewardXp,
 *     'daily_mission_complete', `${missionId}-${claimDate}`).
 *     The UNIQUE (user_id, reason, ref_id) index from
 *     migration 0041 makes retry/replay safe.
 *   - FE refactor: API-backed state, no localStorage.
 *
 * Mission catalog, rotation rules, and reset semantics belong in the
 * Wave 6 design conversation (cohesive with BRAND tokens + page
 * redesign discussion).
 *
 * Mobile: collapsed accordion. Desktop: always visible.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useReward } from "@/contexts/RewardContext";
import type { GamificationData } from "@/lib/types";

// ─── Mission definitions (hardcoded, backend later) ──────────────────────────

interface Mission {
  id: string;
  title: string;
  target: number;
  rewardXp: number;
  type: "learn" | "battle" | "social";
  icon: string;
}

const DAILY_MISSIONS: Mission[] = [
  { id: "speak_1", title: "Complete 1 Speaking session", target: 1, rewardXp: 30, type: "learn", icon: "🎤" },
  { id: "xp_50", title: "Earn 50 XP today", target: 50, rewardXp: 20, type: "learn", icon: "⚡" },
  { id: "battle_1", title: "Play 1 ranked battle", target: 1, rewardXp: 25, type: "battle", icon: "⚔️" },
];

const TYPE_COLORS: Record<string, string> = {
  learn: "#00A896",
  battle: "#6366F1",
  social: "#F59E0B",
};

// ─── Component ───────────────────────────────────────────────────────────────

interface DailyMissionPanelProps {
  gamification: GamificationData | null;
}

export default function DailyMissionPanel({ gamification }: DailyMissionPanelProps) {
  const { fireXP } = useReward();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [expanded, setExpanded] = useState(true); // mobile accordion
  const firedRef = useRef(false);

  // Derive XP progress from gamification data — in-memory only.
  // Wave 6 will replace this with a server-side daily-XP read.
  useEffect(() => {
    if (!gamification) return;
    const currentXp = gamification.xp.xpInLevel;
    setProgress((prev) => {
      const prevXp = prev.xp_50 ?? 0;
      if (currentXp <= prevXp) return prev;
      return { ...prev, xp_50: Math.min(currentXp, 50) };
    });
  }, [gamification]);

  // Check if all missions complete
  const allComplete = DAILY_MISSIONS.every(
    (m) => (progress[m.id] ?? 0) >= m.target
  );

  // Fire daily completion bonus once
  useEffect(() => {
    if (allComplete && !dailyCompleted && !firedRef.current) {
      firedRef.current = true;
      setDailyCompleted(true);
      // Small delay so user sees the last mission check first
      setTimeout(() => {
        fireXP(50, "mission");
      }, 800);
    }
  }, [allComplete, dailyCompleted, fireXP]);

  // Manual progress update — in-memory only. Currently 0 callers
  // (Wave 5.4.3 audit confirmed); Wave 6 will wire Speaking/Battle
  // completion handlers through this exported callback.
  const incrementMission = useCallback((missionId: string, amount = 1) => {
    setProgress((prev) => ({ ...prev, [missionId]: (prev[missionId] ?? 0) + amount }));
  }, []);

  const completedCount = DAILY_MISSIONS.filter(
    (m) => (progress[m.id] ?? 0) >= m.target
  ).length;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface-primary)",
        border: "1px solid var(--surface-border)",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 lg:cursor-default"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
            Daily Missions
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: allComplete ? "rgba(0,168,150,0.15)" : "var(--surface-skeleton)",
              color: allComplete ? "#00A896" : "var(--color-text-tertiary)",
            }}
          >
            {completedCount}/{DAILY_MISSIONS.length}
          </span>
        </div>
        {/* Mobile chevron */}
        <svg
          width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="lg:hidden transition-transform"
          style={{
            color: "var(--color-text-tertiary)",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Mission list */}
      <div
        className={`lg:block ${expanded ? "block" : "hidden"}`}
        style={{ borderTop: "1px solid var(--surface-border-subtle)" }}
      >
        {DAILY_MISSIONS.map((mission) => {
          const current = Math.min(progress[mission.id] ?? 0, mission.target);
          const done = current >= mission.target;
          const pct = Math.min((current / mission.target) * 100, 100);
          const color = TYPE_COLORS[mission.type] ?? "#00A896";

          return (
            <div
              key={mission.id}
              className="px-5 py-3.5 flex items-center gap-3 relative overflow-hidden"
              style={{
                borderBottom: "1px solid var(--surface-border-subtle)",
                opacity: done ? 0.7 : 1,
              }}
            >
              {/* Completion sweep background */}
              {done && (
                <div
                  className="absolute inset-0 animate-mission-sweep pointer-events-none"
                  style={{ background: `${color}08` }}
                />
              )}

              {/* Checkbox */}
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{
                  background: done ? `${color}20` : "var(--surface-subtle)",
                  border: `1.5px solid ${done ? color : "var(--surface-border)"}`,
                }}
              >
                {done && (
                  <svg
                    width={12} height={12} viewBox="0 0 24 24" fill="none"
                    stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                    className="animate-mission-check"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>

              {/* Mission info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: done ? "var(--color-text-tertiary)" : "var(--color-text)" }}>
                    {mission.icon}
                  </span>
                  <span
                    className="text-xs font-medium truncate"
                    style={{
                      color: done ? "var(--color-text-tertiary)" : "var(--color-text)",
                      textDecoration: done ? "line-through" : "none",
                    }}
                  >
                    {mission.title}
                  </span>
                </div>
                {/* Progress bar */}
                {!done && (
                  <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: "var(--surface-skeleton)" }}>
                    <div
                      className="h-full rounded-full xp-bar-animated"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                )}
              </div>

              {/* XP reward badge */}
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                style={{
                  background: done ? `${color}15` : "var(--surface-subtle)",
                  color: done ? color : "var(--color-text-tertiary)",
                }}
              >
                +{mission.rewardXp} XP
              </span>
            </div>
          );
        })}

        {/* Daily Complete banner */}
        {allComplete && (
          <div
            className="px-5 py-3 flex items-center justify-center gap-2"
            style={{ background: "rgba(0,168,150,0.08)" }}
          >
            <span className="text-xs font-semibold" style={{ color: "#00A896" }}>
              🎯 Daily Complete! +50 Bonus XP
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
