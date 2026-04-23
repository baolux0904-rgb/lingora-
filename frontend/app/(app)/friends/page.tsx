"use client";

import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/AnimatedBackground";
import Topbar from "@/components/Topbar";
import { useAppData } from "@/contexts/AppDataContext";

const FriendsTab = dynamic(() => import("@/components/Social/FriendsTab"), { ssr: false });

export default function FriendsPage() {
  const { displayStreak } = useAppData();

  return (
    <div className="min-h-dvh relative">
      <AnimatedBackground variant="subtle" />
      <div className="lg:hidden">
        <Topbar streak={displayStreak} />
      </div>
      <div className="mx-auto px-5 py-6 max-w-2xl lg:max-w-4xl animate-fadeSlideUp">
        <FriendsTab />
      </div>
    </div>
  );
}
