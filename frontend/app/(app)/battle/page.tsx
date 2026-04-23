"use client";

import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/AnimatedBackground";
import Topbar from "@/components/Topbar";
import { useAppData } from "@/contexts/AppDataContext";

const BattleTab = dynamic(() => import("@/components/Battle/BattleTab"), { ssr: false });

export default function BattlePage() {
  const { displayStreak } = useAppData();

  return (
    <div className="min-h-dvh relative">
      <AnimatedBackground variant="none" />
      <div className="lg:hidden">
        <Topbar streak={displayStreak} />
      </div>
      <div className="mx-auto px-5 py-6 max-w-2xl lg:max-w-4xl animate-fadeSlideUp">
        <BattleTab />
      </div>
    </div>
  );
}
