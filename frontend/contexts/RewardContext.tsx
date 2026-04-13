"use client";

/**
 * RewardContext.tsx — Global reward event queue.
 *
 * Provides useReward() hook to fire XP, badge, and level-up events
 * from anywhere in the app. Events are queued and processed one at a time
 * to prevent animation stacking. Duplicate XP events within 1s are suppressed.
 */

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

// ─── Event types ─────────────────────────────────────────────────────────────

export type RewardEvent =
  | { type: "xp_gain"; amount: number; bonus?: number; source: "speaking" | "writing" | "battle" | "mission" | "lesson" }
  | { type: "badge_unlock"; badgeId: string; badgeName: string; badgeIcon?: string; rarity: "common" | "rare" | "epic"; category: string; xpReward?: number }
  | { type: "level_up"; oldLevel: number; newLevel: number; totalXp: number };

interface RewardContextValue {
  /** Currently displayed event (null when idle) */
  activeEvent: RewardEvent | null;
  /** Fire an XP gain toast */
  fireXP: (amount: number, source: RewardEvent & { type: "xp_gain" } extends infer T ? T extends { source: infer S } ? S : never : never, bonus?: number) => void;
  /** Fire a badge unlock toast */
  fireBadge: (badgeId: string, badgeName: string, rarity: "common" | "rare" | "epic", category: string, opts?: { badgeIcon?: string; xpReward?: number }) => void;
  /** Fire a level-up celebration */
  fireLevel: (oldLevel: number, newLevel: number, totalXp: number) => void;
  /** Dismiss the current event and advance queue */
  dismiss: () => void;
}

const RewardContext = createContext<RewardContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function RewardProvider({ children }: { children: ReactNode }) {
  const [activeEvent, setActiveEvent] = useState<RewardEvent | null>(null);
  const queueRef = useRef<RewardEvent[]>([]);
  const lastXpRef = useRef<number>(0); // timestamp of last XP event for dedup

  const processNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      setActiveEvent(null);
      return;
    }
    const next = queueRef.current.shift()!;
    setActiveEvent(next);
  }, []);

  const enqueue = useCallback((event: RewardEvent) => {
    // Suppress duplicate XP events within 1s
    if (event.type === "xp_gain") {
      const now = Date.now();
      if (now - lastXpRef.current < 1000) return;
      lastXpRef.current = now;
    }

    if (activeEvent) {
      // Already showing something — queue it
      queueRef.current.push(event);
    } else {
      // Nothing showing — display immediately
      setActiveEvent(event);
    }
  }, [activeEvent]);

  const dismiss = useCallback(() => {
    // Small delay before processing next to prevent jarring transitions
    setTimeout(processNext, 150);
  }, [processNext]);

  const fireXP = useCallback((amount: number, source: "speaking" | "writing" | "battle" | "mission" | "lesson", bonus?: number) => {
    enqueue({ type: "xp_gain", amount, source, bonus });
  }, [enqueue]);

  const fireBadge = useCallback((badgeId: string, badgeName: string, rarity: "common" | "rare" | "epic", category: string, opts?: { badgeIcon?: string; xpReward?: number }) => {
    enqueue({ type: "badge_unlock", badgeId, badgeName, rarity, category, ...opts });
  }, [enqueue]);

  const fireLevel = useCallback((oldLevel: number, newLevel: number, totalXp: number) => {
    enqueue({ type: "level_up", oldLevel, newLevel, totalXp });
  }, [enqueue]);

  return (
    <RewardContext.Provider value={{ activeEvent, fireXP, fireBadge, fireLevel, dismiss }}>
      {children}
    </RewardContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useReward(): RewardContextValue {
  const ctx = useContext(RewardContext);
  if (!ctx) throw new Error("useReward must be used within RewardProvider");
  return ctx;
}
