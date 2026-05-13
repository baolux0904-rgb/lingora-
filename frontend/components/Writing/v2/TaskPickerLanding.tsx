"use client";

/**
 * TaskPickerLanding — Writing Practice landing screen.
 *
 * 2 editorial cards: Task 1 (chart description) and Task 2 (essay).
 * Each routes to its editorial essay picker. Pure typography, hairline
 * dividers, peer voice. No decoration emojis.
 *
 * Mounted at /exam/writing/practice via Commit 2 routing wire-up.
 */

import Link from "next/link";
import { BarChart3, PenLine, Clock, ArrowRight } from "lucide-react";

interface TaskCard {
  id: "task1" | "task2";
  title: string;
  description: string;
  meta: string;
  Icon: typeof BarChart3;
  href: string;
}

const TASKS: TaskCard[] = [
  {
    id: "task1",
    title: "Task 1",
    description:
      "Mô tả biểu đồ, bảng, hoặc bản đồ. Tóm tắt dữ liệu và so sánh các đặc điểm chính trong khoảng 150 từ.",
    meta: "20 phút · ~150 từ",
    Icon: BarChart3,
    href: "/exam/writing/practice/task1",
  },
  {
    id: "task2",
    title: "Task 2",
    description:
      "Bài luận quan điểm. Lập luận, đưa ví dụ, kết luận trong khoảng 250 từ.",
    meta: "40 phút · ~250 từ",
    Icon: PenLine,
    href: "/exam/writing/practice/task2",
  },
];

export default function TaskPickerLanding() {
  return (
    <div className="max-w-[920px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium mb-8">
        <Link
          href="/exam/writing"
          className="inline-flex items-center gap-1 transition-colors hover:text-teal"
          style={{ color: "var(--color-teal-accent, #5DCAA5)" }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Writing
        </Link>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ color: "var(--color-text-tertiary)" }}>Luyện tập</span>
      </nav>

      {/* Header */}
      <header className="mb-12 lg:mb-16">
        <h1
          className="font-display italic text-[32px] sm:text-[40px] leading-tight tracking-tighter"
          style={{ color: "var(--color-text)" }}
        >
          Chọn dạng đề
        </h1>
        <p
          className="mt-3 text-[15px] sm:text-[16px] leading-relaxed max-w-[560px]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Task 1 luyện mô tả dữ liệu. Task 2 luyện lập luận. Bạn có thể luyện
          từng task riêng, không giới hạn thời gian.
        </p>
      </header>

      {/* Task cards — hairline-divider list, editorial */}
      <ul className="list-none p-0 m-0">
        {TASKS.map((task, idx) => (
          <li
            key={task.id}
            className="border-t"
            style={{ borderColor: "rgba(229,220,198,0.16)" }}
          >
            <Link
              href={task.href}
              className="group block py-8 lg:py-10 transition-colors duration-fast focus:outline-none focus-visible:bg-[rgba(0,168,150,0.04)]"
            >
              <div className="flex items-start gap-5 sm:gap-7">
                <span
                  className="font-display italic text-[28px] sm:text-[32px] tabular-nums shrink-0 mt-1"
                  style={{ color: "var(--color-text-tertiary)" }}
                  aria-hidden="true"
                >
                  0{idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <div
                    className="text-[10px] uppercase tracking-[0.16em] font-semibold mb-2"
                    style={{ color: "#5DCAA5" }}
                  >
                    Dạng đề
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <task.Icon
                      className="w-5 h-5 shrink-0"
                      strokeWidth={2}
                      style={{ color: "var(--color-text-tertiary)" }}
                      aria-hidden="true"
                    />
                    <h2
                      className="font-display italic text-[24px] sm:text-[28px] leading-tight"
                      style={{ color: "var(--color-text)" }}
                    >
                      {task.title}
                    </h2>
                  </div>
                  <p
                    className="text-[14px] sm:text-[15px] leading-relaxed max-w-[560px] mb-4"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {task.description}
                  </p>
                  <div
                    className="flex items-center gap-1.5 text-[13px] tabular-nums"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    <Clock className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                    <span>{task.meta}</span>
                  </div>
                </div>

                <ArrowRight
                  className="w-5 h-5 mt-2 shrink-0 transition-transform duration-fast group-hover:translate-x-1"
                  strokeWidth={2}
                  style={{ color: "var(--color-text-tertiary)" }}
                  aria-hidden="true"
                />
              </div>
            </Link>
          </li>
        ))}
        <li
          className="border-t"
          style={{ borderColor: "rgba(229,220,198,0.16)" }}
          aria-hidden="true"
        />
      </ul>
    </div>
  );
}
