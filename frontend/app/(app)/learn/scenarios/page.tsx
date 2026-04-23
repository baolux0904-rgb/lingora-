"use client";

import AnimatedBackground from "@/components/AnimatedBackground";
import Topbar from "@/components/Topbar";
import ScenariosScreen from "@/components/screens/ScenariosScreen";
import { useAppData } from "@/contexts/AppDataContext";

export default function LearnScenariosPage() {
  const { displayStreak } = useAppData();
  return (
    <div className="min-h-dvh relative">
      <AnimatedBackground variant="subtle" />
      <div className="lg:hidden"><Topbar streak={displayStreak} /></div>
      <div className="mx-auto px-5 py-6 max-w-2xl lg:max-w-4xl animate-fadeSlideUp">
        <ScenariosScreen />
      </div>
    </div>
  );
}
