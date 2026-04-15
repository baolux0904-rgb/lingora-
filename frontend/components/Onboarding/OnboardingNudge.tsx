"use client";

/**
 * OnboardingNudge.tsx — Dashboard nudge for users who skipped onboarding.
 * Shows max 3 times, dismiss persists in localStorage.
 */

import { useState, useEffect } from "react";

interface OnboardingNudgeProps {
  onStart: () => void;
}

const STORAGE_KEY = "lingona_onboarding_nudge_dismissed";
const MAX_SHOWS = 3;

export default function OnboardingNudge({ onStart }: OnboardingNudgeProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const count = parseInt(dismissed, 10);
      if (count >= MAX_SHOWS) return;
      localStorage.setItem(STORAGE_KEY, String(count + 1));
    } else {
      localStorage.setItem(STORAGE_KEY, "1");
    }
    setVisible(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, String(MAX_SHOWS));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="rounded-xl p-4 relative" style={{
      background: "linear-gradient(135deg, rgba(139,113,234,0.08), rgba(45,212,191,0.06))",
      border: "1px solid rgba(139,113,234,0.15)",
    }}>
      <button onClick={handleDismiss} className="absolute top-3 right-3 text-xs" style={{ color: "#475569" }}>✕</button>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0" style={{ background: "rgba(139,113,234,0.12)" }}>
          🎤
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
            Kiểm tra band của bạn trong 30 giây
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            Biết chính xác mình đang ở đâu
          </div>
        </div>
      </div>
      <button onClick={onStart} className="mt-3 px-4 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95"
        style={{ background: "linear-gradient(135deg, #8B71EA, #2DD4BF)", color: "#fff" }}>
        Bắt đầu ngay
      </button>
    </div>
  );
}
