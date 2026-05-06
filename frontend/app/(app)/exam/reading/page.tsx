"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Topbar from "@/components/Topbar";
import ExamModeSelection from "@/components/ExamModeSelection/ExamModeSelection";
import ProUpgradeModal from "@/components/Pro/ProUpgradeModal";
import { useDailyLimits } from "@/hooks/useDailyLimits";
import { useAppData } from "@/contexts/AppDataContext";

export default function ExamReadingPage() {
  const router = useRouter();
  const { isPro } = useDailyLimits();
  const { displayStreak } = useAppData();
  const [showPro, setShowPro] = useState(false);

  return (
    <div className="min-h-dvh relative bg-exam">
      <AnimatedBackground variant="minimal" />
      <div className="lg:hidden"><Topbar streak={displayStreak} /></div>
      <div className="mx-auto px-5 py-6 max-w-2xl lg:max-w-4xl animate-fadeSlideUp">
        <ExamModeSelection
          skill="reading"
          skillLabel="Reading"
          fullTestCopy={{
            body: "Làm bài thi đầy đủ 3 passages × 40 câu trong 60 phút. Chấm điểm band cuối cùng như thi thật.",
            meta: "60 phút · Band score chính thức",
          }}
          practiceCopy={{
            body: "Luyện từng passage riêng biệt. Giải thích chi tiết từng câu, highlight keywords.",
            meta: "Giải thích AI · Keywords · Không giới hạn",
          }}
          fullTestCTA={{
            label: "Bắt đầu thi thật →",
            locked: !isPro,
            onClick: () => {
              if (!isPro) { setShowPro(true); return; }
              // Wave 6 Sprint 5L (2/3) — direct mount runner. Was
              // /home-legacy?tab=reading&mode=full_test which had a
              // perceived no-op due to AppShell layout collision (Bug B).
              router.push("/exam/reading/full-test");
            },
          }}
          practiceCTA={{
            label: "Luyện tập ngay →",
            // Sprint 5L (2/3) — same pattern, was /home-legacy.
            onClick: () => router.push("/exam/reading/practice"),
          }}
        />
      </div>
      <ProUpgradeModal isOpen={showPro} onClose={() => setShowPro(false)} onUpgraded={() => setShowPro(false)} />
    </div>
  );
}
