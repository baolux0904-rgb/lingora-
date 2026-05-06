"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import SkillPageShell from "@/components/SkillPageShell";
import ExamModeSelection from "@/components/ExamModeSelection/ExamModeSelection";
import ComingSoonModal from "@/components/ExamModeSelection/ComingSoonModal";
import ProUpgradeModal from "@/components/Pro/ProUpgradeModal";
import { useDailyLimits } from "@/hooks/useDailyLimits";

export default function ExamSpeakingPage() {
  const router = useRouter();
  const { isPro } = useDailyLimits();
  const [showPro, setShowPro] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  return (
    <SkillPageShell
      skillKey="speaking"
      title="Speaking"
      subtitle="Bạn muốn thi thật hay luyện từng phần?"
      breadcrumb={[
        { label: "IELTS Exam", href: "/exam" },
        { label: "Speaking" },
      ]}
    >
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
            // Wave 6 Sprint 5L (3/3) — push to /exam (the IELTS
            // picker that ExamScreen mounts via onStartIelts).
            // User clicks a scenario in ExamScreen → onStartIelts
            // pushes to /exam/speaking/[id] (5L 1/3 runner).
            router.push("/exam");
          },
        }}
        practiceCTA={{
          label: "Luyện tập ngay →",
          comingSoon: true,
          onClick: () => setShowComingSoon(true),
        }}
      />
      <ProUpgradeModal isOpen={showPro} onClose={() => setShowPro(false)} onUpgraded={() => setShowPro(false)} />
      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        title="Luyện từng Part đang phát triển"
        body="Hiện tại bạn có thể dùng Full Test để luyện Speaking đầy đủ Part 1 + 2 + 3. Tính năng luyện từng Part riêng biệt sẽ ra mắt trong bản cập nhật tới."
      />
    </SkillPageShell>
  );
}
