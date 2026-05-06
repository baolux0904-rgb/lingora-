"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import SkillPageShell from "@/components/SkillPageShell";
import ExamModeSelection from "@/components/ExamModeSelection/ExamModeSelection";
import ProUpgradeModal from "@/components/Pro/ProUpgradeModal";
import { useDailyLimits } from "@/hooks/useDailyLimits";

export default function ExamReadingPage() {
  const router = useRouter();
  const { isPro } = useDailyLimits();
  const [showPro, setShowPro] = useState(false);

  return (
    <SkillPageShell
      skillKey="reading"
      title="Reading"
      subtitle="Bạn muốn thi thật hay luyện từng phần?"
      breadcrumb={[
        { label: "IELTS Exam", href: "/exam" },
        { label: "Reading" },
      ]}
    >
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
      <ProUpgradeModal isOpen={showPro} onClose={() => setShowPro(false)} onUpgraded={() => setShowPro(false)} />
    </SkillPageShell>
  );
}
