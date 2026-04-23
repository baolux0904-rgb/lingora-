"use client";

import AnimatedBackground from "@/components/AnimatedBackground";
import Topbar from "@/components/Topbar";
import ProfileScreen from "@/components/ProfileScreen";
import { useAppData } from "@/contexts/AppDataContext";

export default function ProfilePage() {
  const { userId, gamification, speakingMetrics, speakingMetricsLoading, displayStreak } = useAppData();

  return (
    <div className="min-h-dvh relative">
      <AnimatedBackground variant="subtle" />
      <div className="lg:hidden">
        <Topbar streak={displayStreak} />
      </div>
      <div className="mx-auto px-5 py-6 max-w-2xl lg:max-w-4xl animate-fadeSlideUp">
        <ProfileScreen
          userId={userId}
          metrics={speakingMetrics}
          metricsLoading={speakingMetricsLoading}
          gamification={gamification}
        />
      </div>
    </div>
  );
}
