"use client";

/**
 * ExamModeSelection — shared Mode Selection card pair.
 *
 * Per design approved (screenshot). Navy Full Test card (left) + teal
 * Practice card (right). Uses canonical palette vars established in PR4a.
 *
 * Card CTA dispatch is controller-owned (parent decides navigate vs
 * modal). Lock badge / Coming soon badge are purely visual — click
 * still fires onClick so caller can open ProUpgradeModal or
 * ComingSoonModal as appropriate.
 */

import Link from "next/link";

export type ModeCTAConfig = {
  label: string;
  onClick: () => void;
  locked?: boolean;
  comingSoon?: boolean;
};

export type ExamModeSelectionProps = {
  skill: "speaking" | "writing" | "reading" | "listening";
  skillLabel: string;
  fullTestCopy: { body: string; meta: string };
  practiceCopy: { body: string; meta: string };
  fullTestCTA: ModeCTAConfig;
  practiceCTA: ModeCTAConfig;
};

function LockBadge() {
  return (
    <div
      className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
      style={{
        background: "rgba(245, 158, 11, 0.15)",
        color: "var(--color-amber)",
        border: "1px solid rgba(245, 158, 11, 0.3)",
      }}
    >
      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      Pro
    </div>
  );
}

function ComingSoonBadge() {
  return (
    <div
      className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
      style={{
        background: "rgba(29, 158, 117, 0.15)",
        color: "var(--color-teal-accent)",
        border: "1px solid var(--color-border-teal)",
      }}
    >
      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.2H22l-6 4.4 2.4 7.2L12 16.8l-6.4 4-2.4 7.2L3 9.6l8.4-.4z" />
      </svg>
      Sắp ra mắt
    </div>
  );
}

export default function ExamModeSelection({
  skillLabel,
  fullTestCopy,
  practiceCopy,
  fullTestCTA,
  practiceCTA,
}: ExamModeSelectionProps) {
  const fullTestBadge = fullTestCTA.locked ? "lock" : fullTestCTA.comingSoon ? "soon" : null;
  const practiceBadge = practiceCTA.comingSoon ? "soon" : practiceCTA.locked ? "lock" : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium">
        <Link
          href="/exam"
          className="flex items-center gap-1 transition-colors"
          style={{ color: "var(--color-teal-accent)" }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          IELTS Exam
        </Link>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ color: "var(--color-text-tertiary)" }}>{skillLabel}</span>
      </nav>

      {/* Header */}
      <div>
        <h1
          className="font-display font-bold tracking-tight"
          style={{ fontSize: "28px", lineHeight: 1.15, color: "var(--color-text)" }}
        >
          Chọn chế độ luyện {skillLabel}
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>
          Bạn muốn thi thật hay luyện từng phần?
        </p>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── Full Test card ── */}
        <button
          type="button"
          onClick={fullTestCTA.onClick}
          className="relative text-left rounded-2xl p-6 transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          style={{
            background: "var(--color-bg-navy)",
            border: "1px solid rgba(255,255,255,0.08)",
            minHeight: 260,
          }}
        >
          {fullTestBadge === "lock" && <LockBadge />}
          {fullTestBadge === "soon" && <ComingSoonBadge />}

          {/* Icon chip */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
            style={{ background: "rgba(255,255,255,0.08)", color: "var(--color-amber)" }}
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>

          {/* Eyebrow */}
          <div
            className="font-semibold mb-2"
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--color-amber)",
              textTransform: "uppercase",
            }}
          >
            Full Test Mode
          </div>

          {/* Title */}
          <h2
            className="font-display font-bold mb-3"
            style={{ fontSize: 22, lineHeight: 1.2, color: "#F7F4EC" }}
          >
            Thi thật
          </h2>

          {/* Body */}
          <p
            className="text-sm mb-4"
            style={{ color: "rgba(247, 244, 236, 0.72)", lineHeight: 1.55 }}
          >
            {fullTestCopy.body}
          </p>

          {/* Meta */}
          <div
            className="flex items-center gap-2 text-xs mb-5"
            style={{ color: "var(--color-amber)" }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{fullTestCopy.meta}</span>
          </div>

          {/* CTA */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold"
            style={{ background: "var(--color-amber)", color: "var(--color-bg-navy)" }}
          >
            {fullTestCTA.label}
          </div>
        </button>

        {/* ── Practice card ── */}
        <button
          type="button"
          onClick={practiceCTA.onClick}
          className="relative text-left rounded-2xl p-6 transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          style={{
            background: "var(--color-bg-teal-surface)",
            border: "1px solid var(--color-border-teal)",
            minHeight: 260,
          }}
        >
          {practiceBadge === "soon" && <ComingSoonBadge />}
          {practiceBadge === "lock" && <LockBadge />}

          {/* Icon chip */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
            style={{ background: "var(--color-teal)", color: "#FFFFFF" }}
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </div>

          {/* Eyebrow */}
          <div
            className="font-semibold mb-2"
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--color-teal-accent)",
              textTransform: "uppercase",
            }}
          >
            Practice Mode
          </div>

          {/* Title */}
          <h2
            className="font-display font-bold mb-3"
            style={{ fontSize: 22, lineHeight: 1.2, color: "var(--color-text)" }}
          >
            Luyện tập
          </h2>

          {/* Body */}
          <p
            className="text-sm mb-4"
            style={{ color: "var(--color-text-secondary)", lineHeight: 1.55 }}
          >
            {practiceCopy.body}
          </p>

          {/* Meta */}
          <div
            className="flex items-center gap-2 text-xs mb-5"
            style={{ color: "var(--color-teal-meta)" }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{practiceCopy.meta}</span>
          </div>

          {/* CTA */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold"
            style={{ background: "var(--color-teal)", color: "#FFFFFF" }}
          >
            {practiceCTA.label}
          </div>
        </button>
      </div>
    </div>
  );
}
