"use client";

import { useState } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Topbar from "@/components/Topbar";
import ExamModeSelection from "@/components/ExamModeSelection/ExamModeSelection";
import ComingSoonModal from "@/components/ExamModeSelection/ComingSoonModal";
import { useAppData } from "@/contexts/AppDataContext";

export default function ExamListeningPage() {
  const { displayStreak } = useAppData();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const openComingSoon = () => setShowComingSoon(true);

  return (
    <div className="min-h-dvh relative bg-exam">
      <AnimatedBackground variant="minimal" />
      <div className="lg:hidden"><Topbar streak={displayStreak} /></div>
      <div className="mx-auto px-5 py-6 max-w-2xl lg:max-w-4xl animate-fadeSlideUp">
        <ExamModeSelection
          skill="listening"
          skillLabel="Listening"
          fullTestCopy={{
            body: "Làm bài thi đầy đủ 4 sections trong 30 phút. Chấm điểm band cuối cùng như thi thật.",
            meta: "30 phút · Band score chính thức",
          }}
          practiceCopy={{
            body: "Luyện từng section riêng biệt. Xem transcript, phát lại chậm, highlight từ khó.",
            meta: "Transcript · Slow playback · Không giới hạn",
          }}
          fullTestCTA={{
            label: "Bắt đầu thi thật →",
            comingSoon: true,
            onClick: openComingSoon,
          }}
          practiceCTA={{
            label: "Luyện tập ngay →",
            comingSoon: true,
            onClick: openComingSoon,
          }}
        />
      </div>
      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        title="Luyện Listening sẽ ra mắt trong bản cập nhật tới"
        body="Đội ngũ Lingona đang hoàn thiện bài nghe theo chuẩn IELTS. Bạn sẽ được nhận thông báo khi tính năng sẵn sàng."
      />
    </div>
  );
}
