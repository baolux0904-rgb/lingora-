"use client";

/**
 * Listening route placeholder — the IELTS Listening tab is "coming soon"
 * in the current build (no ListeningTab component exists yet). This page
 * mirrors the placeholder the legacy god-component shows under
 * /home-legacy?tab=listening, just lifted out of the tab switch.
 */

import AnimatedBackground from "@/components/AnimatedBackground";
import Topbar from "@/components/Topbar";
import { useAppData } from "@/contexts/AppDataContext";

export default function ExamListeningPage() {
  const { displayStreak } = useAppData();
  return (
    <div className="min-h-dvh relative bg-exam">
      <AnimatedBackground variant="minimal" />
      <div className="lg:hidden"><Topbar streak={displayStreak} /></div>
      <div className="mx-auto px-5 py-6 max-w-2xl lg:max-w-4xl animate-fadeSlideUp">
        <div className="text-center py-20">
          <div className="text-4xl mb-4">🎧</div>
          <h2 className="text-xl font-display font-bold mb-2" style={{ color: "var(--color-text)" }}>
            Listening Practice
          </h2>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Coming soon — practice IELTS listening with AI-scored comprehension
          </p>
        </div>
      </div>
    </div>
  );
}
