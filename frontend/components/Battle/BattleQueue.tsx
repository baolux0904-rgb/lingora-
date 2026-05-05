"use client";

/**
 * BattleQueue.tsx — Matchmaking screen.
 *
 * Joins queue, polls match status every 3s until active, shows searching animation.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { joinBattleQueue, getBattleMatch, leaveBattleQueue } from "@/lib/api";
import { useOnboardingStatus } from "@/lib/hooks/useOnboardingStatus";
import OnboardingGateModal from "@/components/Onboarding/OnboardingGateModal";

interface BattleQueueProps {
  onMatched: (matchId: string) => void;
  onCancel: () => void;
}

export default function BattleQueue({ onMatched, onCancel }: BattleQueueProps) {
  const [status, setStatus] = useState<"joining" | "queued" | "error">("joining");
  const [matchId, setMatchId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Wave 6 Sprint 4E.2 — onboarding soft-gate. Pauses the auto-join
  // useEffect until the user either completes onboarding or skips the
  // gate. Skip continues to queue join; backend matchmaker handles
  // null estimated_band by defaulting to 5.0 for fairness banding.
  const onboarding = useOnboardingStatus();
  const [gateOpen, setGateOpen] = useState(false);
  const [gateResolved, setGateResolved] = useState(false);

  // Wall-clock elapsed (Wave 4.11 pattern). Display only here, but keep
  // the same shape as BattleMatch so a hidden tab doesn't show a frozen
  // "Finding opponent..." counter.
  const startTimeMsRef = useRef<number | null>(null);
  const [, setTick] = useState(0);
  const elapsed = startTimeMsRef.current === null
    ? 0
    : Math.floor((Date.now() - startTimeMsRef.current) / 1000);

  const cleanup = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // Join queue on mount — but pause if onboarding gate needs to fire.
  useEffect(() => {
    let cancelled = false;

    // Wait for onboarding status to load before deciding.
    if (onboarding.loading) return;
    // Open the gate once and bail; user choice flips gateResolved
    // which re-runs this useEffect.
    if (
      !gateResolved &&
      onboarding.status &&
      !onboarding.status.has_completed_onboarding
    ) {
      setGateOpen(true);
      return;
    }

    (async () => {
      try {
        const result = await joinBattleQueue("ranked");
        if (cancelled) return;

        if (result.status === "matched") {
          onMatched(result.match.id);
          return;
        }

        if (result.status === "already_in_match") {
          onMatched(result.match.id);
          return;
        }

        // Queued — start polling
        setMatchId(result.match.id);
        setStatus("queued");
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setError(err instanceof Error ? err.message : "Failed to join queue");
        }
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboarding.loading, onboarding.status?.has_completed_onboarding, gateResolved]);

  // Poll match status + elapsed timer
  useEffect(() => {
    if (status !== "queued" || !matchId) return;

    if (startTimeMsRef.current === null) startTimeMsRef.current = Date.now();
    timerRef.current = setInterval(() => setTick((n) => n + 1), 1000);
    const onVisibility = () => { if (!document.hidden) setTick((n) => n + 1); };
    document.addEventListener("visibilitychange", onVisibility);

    pollRef.current = setInterval(async () => {
      try {
        const data = await getBattleMatch(matchId);
        if (data.match.status === "active" || data.match.status === "awaiting_opponent") {
          cleanup();
          onMatched(matchId);
        }
      } catch { /* silent — keep polling */ }
    }, 3000);

    return () => {
      cleanup();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [status, matchId, cleanup, onMatched]);

  const handleCancel = async () => {
    cleanup();
    try { await leaveBattleQueue(); } catch { /* silent */ }
    onCancel();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      {/* Pulsing search animation */}
      <div className="relative">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
          style={{
            background: "linear-gradient(135deg, #0F1E33, #1B2B4B)",
            border: "2px solid rgba(0,168,150,0.3)",
            boxShadow: "0 0 30px rgba(0,168,150,0.15)",
          }}
        >
          ⚔️
        </div>
        <div
          className="absolute inset-0 rounded-full animate-ping"
          style={{ border: "2px solid rgba(0,168,150,0.2)" }}
        />
      </div>

      {status === "joining" && (
        <p className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
          Joining queue...
        </p>
      )}

      {status === "queued" && (
        <>
          <div className="text-center">
            <p className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
              Finding opponent...
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
              Searching in your rank tier
            </p>
          </div>
          <div className="text-2xl font-mono font-bold" style={{ color: "var(--color-accent)" }}>
            {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
          </div>
        </>
      )}

      {status === "error" && (
        <div className="text-center">
          <p className="text-base font-semibold" style={{ color: "#EF4444" }}>
            {error || "Something went wrong"}
          </p>
        </div>
      )}

      <button
        onClick={handleCancel}
        className="px-6 py-2.5 rounded-xl text-sm font-medium"
        style={{
          background: "var(--color-bg-card)",
          color: "var(--color-text-secondary)",
          border: "1px solid var(--color-border)",
        }}
      >
        Cancel
      </button>

      <OnboardingGateModal
        open={gateOpen}
        onComplete={() => {
          setGateOpen(false);
          setGateResolved(true);
          // User chose to complete onboarding — bail out of queue.
          window.dispatchEvent(new Event("lingona:open-onboarding"));
          onCancel();
        }}
        onSkip={() => {
          setGateOpen(false);
          // gateResolved flip re-runs the auto-join useEffect.
          setGateResolved(true);
        }}
        headline="Cần biết band hiện tại để ghép trận"
        body="Lintopus muốn đảm bảo trận đấu công bằng cho cả hai bên."
      />
    </div>
  );
}
