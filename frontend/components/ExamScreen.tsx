"use client";

/**
 * ExamScreen.tsx — /exam hub. 4-card clean editorial layout.
 *
 * 4 cards (Speaking, Reading, Writing, Listening) → each routes to its
 * sub-hub at /exam/[skill] which renders <ExamModeSelection> with
 * Practice + Full Test options. Listening sub-hub shows a "Sắp ra mắt"
 * modal — single source of truth, no duplicate Coming Soon section here.
 *
 * Per Session 5 polish:
 * - Removed per-card borderLeft accent colors (AI-template feel)
 * - Removed "CONVERSATION PRACTICE" section + Speak Scenarios card
 *   (Nói theo tình huống lives at /learn/scenarios)
 * - Removed bottom "Coming Soon" duplicate section
 * - Single visual language across all 4 cards
 */

import Link from "next/link";
import {
  Mic,
  Headphones,
  BookOpen,
  PenLine,
  Clock,
  ChevronRight,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";

interface ExamModule {
  id: "speaking" | "reading" | "writing" | "listening";
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  duration: string;
  href: string;
}

const EXAM_MODULES: ExamModule[] = [
  {
    id: "speaking",
    title: "IELTS Speaking",
    subtitle: "Phỏng vấn 3 phần với AI examiner",
    Icon: Mic,
    duration: "11-14 phút",
    href: "/exam/speaking",
  },
  {
    id: "reading",
    title: "IELTS Reading",
    subtitle: "3 passages với MCQ, True/False/Not Given, và matching",
    Icon: BookOpen,
    duration: "60 phút",
    href: "/exam/reading",
  },
  {
    id: "writing",
    title: "IELTS Writing",
    subtitle: "Task 1 và Task 2 với AI chấm điểm",
    Icon: PenLine,
    duration: "60 phút",
    href: "/exam/writing",
  },
  {
    id: "listening",
    title: "IELTS Listening",
    subtitle: "Audio luyện tập theo format Cambridge IELTS — sắp ra mắt",
    Icon: Headphones,
    duration: "30 phút",
    href: "/exam/listening",
  },
];

export default function ExamScreen() {
  const isAuthenticated = useAuthStore((s) => !!s.user);
  const authReady = !useAuthStore((s) => s.isLoading);

  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      {/* Header */}
      <header>
        <h1
          className="font-display italic text-[32px] sm:text-[40px] lg:text-[44px] leading-tight tracking-tighter"
          style={{ color: "var(--color-text)" }}
        >
          Luyện đề IELTS
        </h1>
        <p
          className="mt-3 text-[15px] sm:text-[16px] leading-relaxed max-w-[560px]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Chọn kỹ năng bạn muốn luyện — Lingona chấm theo rubric IELTS, feedback từng câu.
        </p>
      </header>

      {/* Auth prompt for guests */}
      {authReady && !isAuthenticated && (
        <Link
          href="/login"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
          style={{
            background: "rgba(0,168,150,0.06)",
            border: "1px solid rgba(0,168,150,0.15)",
          }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(0,168,150,0.10)" }}
          >
            <Lock className="w-4 h-4" strokeWidth={2} style={{ color: "#00A896" }} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              Đăng nhập để bắt đầu luyện đề
            </span>
            <span className="block text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Tạo tài khoản miễn phí để theo dõi tiến độ
            </span>
          </div>
          <ChevronRight className="w-4 h-4 shrink-0" strokeWidth={2} style={{ color: "#00A896" }} aria-hidden="true" />
        </Link>
      )}

      {/* 4-card hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {EXAM_MODULES.map((mod) => (
          <Link
            key={mod.id}
            href={mod.href}
            className="group flex flex-col p-5 sm:p-6 rounded-lg text-left transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
            style={{
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center shrink-0 bg-teal/10 text-teal-dark">
                <mod.Icon className="w-7 h-7" strokeWidth={2} aria-hidden="true" />
              </div>
              <ChevronRight
                className="w-5 h-5 mt-2 shrink-0 transition-transform duration-fast group-hover:translate-x-0.5"
                strokeWidth={2}
                style={{ color: "var(--color-text-tertiary)" }}
                aria-hidden="true"
              />
            </div>

            <h2
              className="font-display italic text-[22px] sm:text-[24px] leading-tight mb-2"
              style={{ color: "var(--color-text)" }}
            >
              {mod.title}
            </h2>

            <p
              className="text-[14px] sm:text-[15px] leading-relaxed mb-4 line-clamp-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {mod.subtitle}
            </p>

            <div
              className="mt-auto flex items-center gap-1.5 text-[13px] tabular-nums"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <Clock className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
              <span>{mod.duration}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
