"use client";

/**
 * OnboardingFlow.tsx — 4-screen onboarding (Wave 2.6).
 *
 * Screen 1: Target band selection
 * Screen 2: Set expectation
 * Screen 3: Self-report current IELTS band (replaces the fake-Math.random
 *           "speaking diagnostic" — Soul §1: never display a fake stat)
 * Screen 4: Transition to app
 *
 * History: Pre-Wave 2.6 there was a 30s mic recording + animated "AI is
 * analyzing…" screens followed by a band scored as
 *   recordTime >= 20 ? 5.5 + Math.random()*1.5 : 4.5 + Math.random()*1.0.
 * That number was never persisted — purely a vanity display. Replaced
 * with an honest self-report dropdown; "Chưa biết" stores NULL.
 */

import { useState, useEffect, useCallback } from "react";
import { completeOnboarding, skipOnboarding } from "@/lib/api";
import { analytics } from "@/lib/analytics";
import Mascot from "@/components/ui/Mascot";
import BandGrid from "./BandGrid";

interface OnboardingFlowProps {
  onComplete: () => void;
}

// Wave 6 Sprint 4B — band picker contract moved into BandGrid component
// (11 half-bands 4.0 → 9.0; the dark inline button grids previously
// rendered here are gone). Backend onboardingController still accepts
// the [3.0, 9.0] floor for legacy clients so existing rows in
// `users.estimated_band` below 4.0 stay valid; the UI just doesn't
// surface those values to new pickers.

type Screen = 1 | 2 | 3 | 4;

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [screen, setScreen] = useState<Screen>(1);
  const [targetBand, setTargetBand] = useState<number | null>(null);
  // null = "Chưa biết" (default). number = the band the user picked.
  const [selfReportedBand, setSelfReportedBand] = useState<number | null>(null);
  const [fade, setFade] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const goTo = useCallback((s: Screen) => {
    setFade(false);
    setTimeout(() => { setScreen(s); setFade(true); }, 300);
  }, []);

  const handleSkip = useCallback(async () => {
    try { await skipOnboarding(); } catch { /* silent */ }
    onComplete();
  }, [onComplete]);

  const handleComplete = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try { await completeOnboarding(targetBand, selfReportedBand); } catch { /* silent */ }
    analytics.onboardingComplete(targetBand, selfReportedBand);
    setSubmitting(false);
    goTo(4);
  }, [targetBand, selfReportedBand, goTo, submitting]);

  // Screen 4: auto-transition into the app.
  useEffect(() => {
    if (screen !== 4) return;
    const t = setTimeout(onComplete, 1500);
    return () => clearTimeout(t);
  }, [screen, onComplete]);

  const SkipLink = () => (
    <button onClick={handleSkip} className="text-xs font-medium mt-4 transition-colors" style={{ color: "#475569" }}>
      Bỏ qua →
    </button>
  );

  return (
    <div className="fixed inset-0 z-splash flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0F172A, #020617)" }}>
      <div className={`w-full max-w-md px-6 flex flex-col items-center text-center transition-opacity duration-300 ${fade ? "opacity-100" : "opacity-0"}`}>

        {/* SCREEN 1 — Target Band */}
        {screen === 1 && (
          <>
            <div className="mb-6">
              <Mascot size={48} />
            </div>
            <h1 className="text-2xl font-display font-bold mb-2" style={{ color: "#F8FAFC" }}>
              Bạn muốn đạt band IELTS mấy?
            </h1>
            <p className="text-xs mb-6" style={{ color: "#64748B" }}>
              Hầu hết học viên đặt mục tiêu 6.5+
            </p>
            <div className="w-full mb-6">
              <BandGrid
                value={targetBand}
                onChange={setTargetBand}
                showUnknownEscape={false}
                mode="dark"
                ariaLabel="Band IELTS mục tiêu"
              />
            </div>
            <button onClick={() => goTo(2)} disabled={!targetBand}
              className="w-full max-w-xs py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
              style={{ background: "linear-gradient(135deg, #8B71EA, #2DD4BF)", color: "#fff" }}>
              Tiếp tục
            </button>
            <SkipLink />
          </>
        )}

        {/* SCREEN 2 — Set Expectation */}
        {screen === 2 && (
          <>
            <div className="mb-6">
              <Mascot size={48} />
            </div>
            <h1 className="text-xl font-display font-bold mb-2" style={{ color: "#F8FAFC" }}>
              Cho Lintopus biết bạn đang ở đâu
            </h1>
            <p className="text-sm mb-8" style={{ color: "#94A3B8" }}>
              Lộ trình của bạn sẽ được cá nhân hóa theo điểm xuất phát thật. Không có áp lực — bạn có thể chọn &quot;Chưa biết&quot;.
            </p>
            <button onClick={() => goTo(3)}
              className="w-full max-w-xs py-4 rounded-xl text-base font-semibold transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, #8B71EA, #2DD4BF)", color: "#fff", boxShadow: "0 0 30px rgba(139,113,234,0.25)" }}>
              Tiếp tục
            </button>
            <SkipLink />
          </>
        )}

        {/* SCREEN 3 — Self-report current band */}
        {screen === 3 && (
          <>
            <div className="mb-6">
              <Mascot size={56} />
            </div>
            <h1 className="text-xl font-display font-bold mb-2" style={{ color: "#F8FAFC" }}>
              Trình độ IELTS hiện tại của bạn?
            </h1>
            <p className="text-xs mb-6" style={{ color: "#64748B" }}>
              Bạn có thể đoán hoặc chọn &quot;Chưa biết&quot;
            </p>

            <div className="w-full mb-6">
              <BandGrid
                value={selfReportedBand}
                onChange={setSelfReportedBand}
                showUnknownEscape={true}
                mode="dark"
                ariaLabel="Band IELTS hiện tại"
              />
            </div>

            <button
              onClick={handleComplete}
              disabled={submitting}
              className="w-full max-w-xs py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #8B71EA, #2DD4BF)", color: "#fff", boxShadow: "0 0 20px rgba(139,113,234,0.3)" }}
            >
              {submitting ? "Đang lưu..." : "Bắt đầu cải thiện →"}
            </button>
            <SkipLink />
          </>
        )}

        {/* SCREEN 4 — Transition */}
        {screen === 4 && (
          <>
            <div className="mb-6">
              <Mascot size={64} />
            </div>
            <h1 className="text-xl font-display font-bold mb-2" style={{ color: "#F8FAFC" }}>
              Hãy cùng lên Band {targetBand?.toFixed(1) || "6.5"}.
            </h1>
            <p className="text-sm mb-6" style={{ color: "#94A3B8" }}>
              Lộ trình của bạn đã sẵn sàng.
            </p>
            <button onClick={onComplete}
              className="px-6 py-3 rounded-xl text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #8B71EA, #2DD4BF)", color: "#fff" }}>
              Vào Lingona →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
