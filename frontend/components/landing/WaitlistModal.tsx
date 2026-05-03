"use client";

/**
 * WaitlistModal — STUB for Sprint 2D commit 2.
 *
 * Full implementation (form + API integration + states) ships in Sprint 2D
 * commit 3 to keep each commit independently buildable.
 */

export type TierKey = "free" | "pro" | "pro_annual";

interface WaitlistModalProps {
  initialTier: TierKey;
  onClose: () => void;
}

export default function WaitlistModal({
  initialTier,
  onClose,
}: WaitlistModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-cream border border-gray-200 rounded-card p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-navy">
          Waitlist modal — full form ships in commit 3 (initial tier:{" "}
          {initialTier}).
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-teal hover:underline"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
