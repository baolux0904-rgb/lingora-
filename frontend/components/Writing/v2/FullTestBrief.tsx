"use client";

/**
 * FullTestBrief — pre-test instructions screen at /exam/writing/full-test.
 *
 * Editorial typography. Rules of engagement + sticky CTA. Single primary
 * button: "Bắt đầu thi" → /exam/writing/full-test/active.
 *
 * Peer voice, no decoration.
 */

import Link from "next/link";
import { ChevronLeft, Clock, FileText, Ban } from "lucide-react";

interface BriefItem {
  Icon: typeof Clock;
  label: string;
  detail: string;
}

const ITEMS: BriefItem[] = [
  {
    Icon: Clock,
    label: "60 phút",
    detail: "Tổng thời gian. Đồng hồ chạy liên tục, không tạm dừng được.",
  },
  {
    Icon: FileText,
    label: "Task 1 + Task 2",
    detail:
      "Task 1 (~20 phút, 150 từ) trước, Task 2 (~40 phút, 250 từ) sau. Bạn tự chia thời gian.",
  },
  {
    Icon: Ban,
    label: "Không paste, không spellcheck",
    detail:
      "Giống phòng thi thật. Bạn gõ bằng tay, AI chấm theo bốn tiêu chí IELTS sau khi nộp cả hai task.",
  },
];

export default function FullTestBrief() {
  return (
    <div className="max-w-[720px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium mb-8">
        <Link
          href="/exam/writing"
          className="inline-flex items-center gap-1 transition-colors hover:text-teal"
          style={{ color: "#5DCAA5" }}
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
          Writing
        </Link>
        <span style={{ color: "var(--color-text-tertiary)" }}>›</span>
        <span style={{ color: "var(--color-text-tertiary)" }}>Thi thật</span>
      </nav>

      {/* Header */}
      <header className="mb-10 lg:mb-12">
        <div
          className="text-[10px] uppercase tracking-[0.16em] font-semibold mb-3"
          style={{ color: "#5DCAA5" }}
        >
          Full Test
        </div>
        <h1
          className="font-display italic text-[34px] sm:text-[42px] leading-tight tracking-tighter"
          style={{ color: "var(--color-text)" }}
        >
          Thi thử như đi thi thật
        </h1>
        <p
          className="mt-4 text-[15px] sm:text-[17px] leading-relaxed max-w-[560px]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Hai task, một đồng hồ chung. Mục tiêu: viết được dưới áp lực thời gian
          và biết mình đang ở band nào trước ngày thi.
        </p>
      </header>

      {/* Rules of engagement */}
      <ul className="list-none p-0 m-0 mb-12">
        {ITEMS.map((it) => (
          <li
            key={it.label}
            className="border-t"
            style={{ borderColor: "rgba(229,220,198,0.16)" }}
          >
            <div className="py-6 lg:py-7 flex items-start gap-5">
              <it.Icon
                className="w-5 h-5 mt-1 shrink-0"
                strokeWidth={2}
                style={{ color: "var(--color-text-tertiary)" }}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <div
                  className="font-display italic text-[20px] sm:text-[22px] leading-tight mb-1.5"
                  style={{ color: "var(--color-text)" }}
                >
                  {it.label}
                </div>
                <p
                  className="text-[14px] sm:text-[15px] leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {it.detail}
                </p>
              </div>
            </div>
          </li>
        ))}
        <li
          className="border-t"
          style={{ borderColor: "rgba(229,220,198,0.16)" }}
          aria-hidden="true"
        />
      </ul>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Link
          href="/exam/writing/full-test/active"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-teal text-cream font-semibold text-base shadow-colored hover:bg-teal-dark transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
        >
          Bắt đầu thi
        </Link>
        <Link
          href="/exam/writing"
          className="inline-flex items-center justify-center px-6 py-3.5 rounded-full text-sm font-medium hover:text-teal transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Quay lại Writing
        </Link>
      </div>

      <p
        className="mt-8 text-[13px] leading-relaxed"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        Bắt đầu là đồng hồ chạy. Nếu chưa sẵn sàng — đóng tab, mình không lưu
        trạng thái nửa chừng.
      </p>
    </div>
  );
}
