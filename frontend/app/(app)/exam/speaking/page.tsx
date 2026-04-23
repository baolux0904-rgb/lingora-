"use client";

import AnimatedBackground from "@/components/AnimatedBackground";
import Topbar from "@/components/Topbar";
import SpeakingHub from "@/components/screens/SpeakingHub";
import { useAppData } from "@/contexts/AppDataContext";

export default function ExamSpeakingPage() {
  const { displayStreak } = useAppData();
  return (
    <div className="min-h-dvh relative bg-exam">
      <AnimatedBackground variant="minimal" />
      <div className="lg:hidden"><Topbar streak={displayStreak} /></div>
      <div className="mx-auto px-5 py-6 max-w-2xl lg:max-w-4xl animate-fadeSlideUp">
        <SpeakingHub />
      </div>
    </div>
  );
}
