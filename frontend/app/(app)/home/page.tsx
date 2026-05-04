"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import Topbar from "@/components/Topbar";
import HomeDashboard from "@/components/HomeDashboard";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuthStore } from "@/lib/stores/authStore";
import { getScenarios } from "@/lib/api";
import type { FocusRecommendation } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { gamification, focusRecs, focusLoading, rankTier, displayStreak } = useAppData();

  if (!user) return null;

  const handleNavigate = (id: string) => {
    switch (id) {
      case "exam":      router.push("/exam"); return;
      case "battle":    router.push("/battle"); return;
      case "social":
      case "friends":   router.push("/friends"); return;
      case "profile":   router.push("/profile"); return;
      default:
        // Tab ids for skills still live in the legacy shell (Writing/Reading/etc).
        router.push(`/home-legacy?tab=${id}`);
    }
  };

  const handleFocusAction = async (rec: FocusRecommendation) => {
    if (rec.scenarioId && rec.actionTarget === "speak") {
      try {
        const scenarios = await getScenarios();
        const match = scenarios.find((s) => s.id === rec.scenarioId);
        if (match) {
          router.push(`/home-legacy?tab=speaking&scenario=${match.id}`);
          return;
        }
      } catch { /* fall through */ }
    }
    handleNavigate(rec.actionTarget);
  };

  return (
    <div className="min-h-dvh relative bg-home">
      <AnimatedBackground variant="expressive" centerGlow />
      <div className="lg:hidden">
        <Topbar streak={displayStreak} />
      </div>
      <div className="mx-auto px-5 py-6 max-w-5xl">
        {/* Wave 6 Sprint 3D — first-time greeting banner. Suspense wraps
            because WelcomeBanner uses useSearchParams which would force
            client-render bailout otherwise (Next.js 14). */}
        <Suspense fallback={null}>
          <WelcomeBanner />
        </Suspense>
        <HomeDashboard
          userName={user.name}
          gamification={gamification}
          focusRecs={focusRecs}
          focusLoading={focusLoading}
          rankTier={rankTier}
          onNavigate={handleNavigate}
          onFocusAction={handleFocusAction}
        />
      </div>
    </div>
  );
}
