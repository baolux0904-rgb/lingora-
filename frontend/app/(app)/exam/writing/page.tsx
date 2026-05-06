"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import SkillPageShell from "@/components/SkillPageShell";
import ExamModeSelection from "@/components/ExamModeSelection/ExamModeSelection";
import ProUpgradeModal from "@/components/Pro/ProUpgradeModal";
import { useDailyLimits } from "@/hooks/useDailyLimits";

export default function ExamWritingPage() {
  const router = useRouter();
  const { isPro } = useDailyLimits();
  const [showPro, setShowPro] = useState(false);

  return (
    <SkillPageShell
      skillKey="writing"
      title="Writing"
      subtitle="Bạn muốn thi thật hay luyện từng phần?"
      breadcrumb={[
        { label: "IELTS Exam", href: "/exam" },
        { label: "Writing" },
      ]}
    >
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
      <ProUpgradeModal isOpen={showPro} onClose={() => setShowPro(false)} onUpgraded={() => setShowPro(false)} />
    </SkillPageShell>
  );
}
