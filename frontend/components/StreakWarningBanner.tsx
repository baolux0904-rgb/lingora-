"use client";

/**
 * StreakWarningBanner.tsx — Inline amber warning when streak is at risk.
 *
 * Rules:
 * - Shows when user hasn't completed any activity today
 * - Only visible within 8h of midnight local time (i.e., after 4pm)
 * - Countdown: "Your streak ends in Xh Xm"
 * - Dismiss hides for 2h (stored in localStorage)
 * - NOT a modal — inline banner on Home dashboard
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StreakSummary } from "@/lib/types";

interface StreakWarningBannerProps {
  streak: StreakSummary | undefined;
  onNavigate: (tab: string) => void;
}

function isDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const dismissedAt = localStorage.getItem("lingona_streak_dismissed");
  if (!dismissedAt) return false;
  return Date.now() - Number(dismissedAt) < 2 * 3600000; // 2h
}

export default function StreakWarningBanner({ streak, onNavigate }: StreakWarningBannerProps) {
  const [visible, setVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    mountedAt.current = Date.now();
    function check() {
      // Don't show if no streak to protect
      if (!streak || streak.currentStreak === 0) return;

      // Don't show if dismissed recently
      if (isDismissed()) return;

      // Compare BE-supplied VN dates — browser TZ may not be Asia/Ho_Chi_Minh
      // (user travelling, VPN, etc.). Single source of truth = backend.
      if (streak.lastActivityAt && streak.lastActivityAt === streak.todayVn) {
        setVisible(false);
        return;
      }

      // Decay the BE-issued countdown locally between fetches so the banner
      // stays accurate without re-polling every minute. Drift is bounded by
      // the parent hook's refetch cadence.
      const elapsedMs = Date.now() - mountedAt.current;
      const remainingSec = Math.max(0, streak.secondsUntilVnMidnight - Math.floor(elapsedMs / 1000));

      // Only show within 8h of VN midnight (after 4pm VN)
      if (remainingSec > 8 * 3600) return;

      setTimeLeft({
        hours:   Math.floor(remainingSec / 3600),
        minutes: Math.floor((remainingSec % 3600) / 60),
      });
      setVisible(true);
    }

    check();
    const interval = setInterval(check, 60000); // update every minute
    return () => clearInterval(interval);
  }, [streak]);

  const handleDismiss = () => {
    localStorage.setItem("lingona_streak_dismissed", String(Date.now()));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
          className="overflow-hidden"
        >
          <div
            className="rounded-xl p-4 flex items-center gap-3"
            style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.04))",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            {/* Fire icon with pulse */}
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "rgba(245,158,11,0.12)",
                animation: "streakWarn 2s ease-in-out infinite",
              }}
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="#F59E0B">
                <path d="M12 2c0 0-7 7-7 13a7 7 0 0 0 14 0c0-6-7-13-7-13z" />
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "#F59E0B" }}>
                Streak at risk!
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(245,158,11,0.7)" }}>
                Your {streak?.currentStreak}-day streak ends in{" "}
                <span className="font-bold" style={{ color: "#F59E0B" }}>
                  {timeLeft.hours}h {timeLeft.minutes}m
                </span>
              </p>
            </div>

            {/* Practice CTA */}
            <button
              onClick={() => onNavigate("learn-speaking")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all active:scale-[0.97] cursor-pointer"
              style={{
                background: "rgba(245,158,11,0.15)",
                color: "#F59E0B",
                border: "1px solid rgba(245,158,11,0.25)",
              }}
            >
              Practice now
            </button>

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
              style={{ color: "rgba(245,158,11,0.5)" }}
              aria-label="Dismiss streak warning"
            >
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <style>{`
            @keyframes streakWarn {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.08); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
