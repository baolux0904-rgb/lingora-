"use client";

/**
 * ComingSoonModal — placeholder dialog for routes whose underlying flow
 * hasn't been built yet (Listening, Speaking Practice-per-Part). Purely
 * informational; no email-collection CTA is wired until a backend endpoint
 * exists (see PR5a report).
 */

import { useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  body: string;
};

export default function ComingSoonModal({ isOpen, onClose, title, body }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "rgba(15, 30, 51, 0.6)" }}
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full rounded-2xl p-6"
        style={{
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: "var(--color-text-tertiary)" }}
          aria-label="Đóng"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background: "rgba(29, 158, 117, 0.12)", color: "var(--color-teal-accent)" }}
        >
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 7.2H22l-6 4.4 2.4 7.2L12 16.8l-6.4 4-2.4 7.2L3 9.6l8.4-.4z" />
          </svg>
        </div>

        <h3
          className="font-display font-bold mb-2"
          style={{ fontSize: 20, color: "var(--color-text)" }}
        >
          {title}
        </h3>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          {body}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full px-4 py-2.5 rounded-full text-sm font-semibold transition-colors"
          style={{ background: "var(--color-teal)", color: "#FFFFFF" }}
        >
          Đã hiểu
        </button>
      </div>
    </div>
  );
}
