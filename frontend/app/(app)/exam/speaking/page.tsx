"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Topbar from "@/components/Topbar";
import ExamModeSelection from "@/components/ExamModeSelection/ExamModeSelection";
import ComingSoonModal from "@/components/ExamModeSelection/ComingSoonModal";
import ProUpgradeModal from "@/components/Pro/ProUpgradeModal";
import { useDailyLimits } from "@/hooks/useDailyLimits";
import { useAppData } from "@/contexts/AppDataContext";

export default function ExamSpeakingPage() {
  const router = useRouter();
  const { isPro } = useDailyLimits();
  const { displayStreak } = useAppData();
  const [showPro, setShowPro] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <div className="min-h-dvh relative bg-exam">
      <AnimatedBackground variant="minimal" />
      <div className="lg:hidden"><Topbar streak={displayStreak} /></div>
      <div className="mx-auto px-5 py-6 max-w-2xl lg:max-w-4xl animate-fadeSlideUp">
        <ExamModeSelection
          skill="speaking"
          skillLabel="Speaking"
          fullTestCopy={{
            body: "Làm bài thi đầy đủ Part 1 + 2 + 3 trong 11–14 phút. Chấm điểm band cuối cùng như thi thật.",
            meta: "11–14 phút · Band score chính thức",
          }}
          practiceCopy={{
            body: "Luyện từng Part riêng biệt. Nhận feedback chi tiết từ AI theo 4 tiêu chí (Fluency, Vocabulary, Grammar, Pronunciation).",
            meta: isPro
              ? "AI feedback · 4 band criteria · Không giới hạn"
              : "AI feedback · 4 band criteria · 1x/ngày miễn phí",
          }}
          fullTestCTA={{
            label: "Bắt đầu thi thật →",
            locked: !isPro,
            onClick: () => {
              if (!isPro) { setShowPro(true); return; }
              router.push("/home-legacy?tab=speaking&mode=full_test");
            },
          }}
          practiceCTA={{
            label: "Luyện tập ngay →",
            comingSoon: true,
            onClick: () => setShowComingSoon(true),
          }}
        />
      </div>
      <ProUpgradeModal isOpen={showPro} onClose={() => setShowPro(false)} onUpgraded={() => setShowPro(false)} />
      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        title="Luyện từng Part đang phát triển"
        body="Hiện tại bạn có thể dùng Full Test để luyện Speaking đầy đủ Part 1 + 2 + 3. Tính năng luyện từng Part riêng biệt sẽ ra mắt trong bản cập nhật tới."
      />
    </div>
  );
}
