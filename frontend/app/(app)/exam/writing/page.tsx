"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Topbar from "@/components/Topbar";
import ExamModeSelection from "@/components/ExamModeSelection/ExamModeSelection";
import ProUpgradeModal from "@/components/Pro/ProUpgradeModal";
import { useDailyLimits } from "@/hooks/useDailyLimits";
import { useAppData } from "@/contexts/AppDataContext";

export default function ExamWritingPage() {
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
          skill="writing"
          skillLabel="Writing"
          fullTestCopy={{
            body: "Làm bài thi đầy đủ Task 1 + Task 2 trong 60 phút. Chấm điểm band cuối cùng như thi thật.",
            meta: "60 phút · Band score chính thức",
          }}
          practiceCopy={{
            body: "Luyện từng Task riêng biệt. Nhận feedback AI theo 4 tiêu chí (Task Response, Coherence, Lexical, Grammar).",
            meta: isPro
              ? "AI feedback · 4 band criteria · Không giới hạn"
              : "AI feedback · 4 band criteria · 1x/ngày miễn phí",
          }}
          fullTestCTA={{
            label: "Bắt đầu thi thật →",
            locked: !isPro,
            onClick: () => {
              if (!isPro) { setShowPro(true); return; }
              // Wave 6 Sprint 5L (2/3) — direct mount runner. Was
              // /home-legacy?tab=writing&mode=full_test which had a
              // perceived no-op due to AppShell layout collision (Bug A).
              router.push("/exam/writing/full-test");
            },
          }}
          practiceCTA={{
            label: "Luyện tập ngay →",
            // Sprint 5L (2/3) — same pattern, was /home-legacy.
            onClick: () => router.push("/exam/writing/practice"),
          }}
        />
      </div>
      <ProUpgradeModal isOpen={showPro} onClose={() => setShowPro(false)} onUpgraded={() => setShowPro(false)} />
    </div>
  );
}
