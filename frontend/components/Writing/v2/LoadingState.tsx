"use client";

import Mascot from "@/components/ui/Mascot";

/**
 * LoadingState — Mascot + peer-voice copy. Static (no progress %).
 * 3x multi-sampling typically takes 15-30s; the copy sets expectation
 * without inventing intermediate updates.
 */
export default function LoadingState() {
  return (
    <div className="max-w-[480px] mx-auto px-6 py-24 text-center flex flex-col items-center gap-4">
      <Mascot size={100} mood="thinking" />
      <p
        className="text-[15px] leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Đang chấm bài, chờ Lingona 1 chút...
      </p>
    </div>
  );
}
