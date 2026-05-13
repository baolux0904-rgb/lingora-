"use client";

import Mascot from "@/components/ui/Mascot";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = "Có lỗi xảy ra khi tải bài chấm. Thử lại nhé.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="max-w-[480px] mx-auto px-6 py-24 text-center flex flex-col items-center gap-4">
      <Mascot size={100} mood="thinking" />
      <p
        className="text-[15px] leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-teal text-cream font-semibold text-sm shadow-colored hover:bg-teal-dark transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}
