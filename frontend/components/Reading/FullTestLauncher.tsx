"use client";

/**
 * FullTestLauncher — list view that lets the learner pick one Full Test
 * (3 passages, 60 min strict). Tests are grouped visually by difficulty
 * tier. Picking a card calls onSelect(testId) so the parent can mount the
 * runner.
 */

import { useEffect, useState } from "react";
import { listReadingFullTests } from "@/lib/api";
import type { ReadingTestSummary, ReadingTestDifficulty } from "@/lib/types";

interface Props {
  onSelect: (testId: string) => void;
  onBack: () => void;
}

const TIER_META: Record<ReadingTestDifficulty, { label: string; sub: string; color: string }> = {
  foundation: { label: "Foundation", sub: "Bài đọc nền tảng band 5.0–5.5", color: "#22C55E" },
  standard:   { label: "Standard",   sub: "Cấu trúc đề thi thật (5.0 → 7.0)", color: "#F59E0B" },
  challenge:  { label: "Challenge",  sub: "Mục tiêu band 7.0+ (đến 8.5)", color: "#EF4444" },
};

export default function FullTestLauncher({ onSelect, onBack }: Props) {
  const [tests, setTests] = useState<ReadingTestSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { tests: rows } = await listReadingFullTests();
        setTests(rows);
      } catch {
        setError("Không tải được danh sách bài thi. Thử lại sau.");
      }
    })();
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium self-start" style={{ color: "var(--color-accent)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        Back
      </button>

      <div>
        <h3 className="text-lg font-display font-bold" style={{ color: "var(--color-text)" }}>Chọn Full Test</h3>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
          1 bài thi = 3 passages, 60 phút bấm giờ, không tạm dừng.
        </p>
      </div>

      {error && (
        <div className="rounded-lg p-3 text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444" }}>
          {error}
        </div>
      )}

      {tests === null && !error && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg p-4 animate-pulse" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}>
              <div className="h-4 w-48 bg-white/5 rounded mb-2" />
              <div className="h-3 w-32 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      )}

      {tests && tests.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Chưa có bài Full Test nào. Hãy chạy seedReadingTests script.
          </p>
        </div>
      )}

      {tests && tests.length > 0 && (
        <div className="flex flex-col gap-3">
          {tests.map((t) => {
            const meta = TIER_META[t.difficulty_tier] ?? { label: t.difficulty_tier, sub: "", color: "var(--color-text-tertiary)" };
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t.id)}
                className="text-left rounded-xl p-4 transition-all active:scale-[0.98]"
                style={{
                  background: "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                  borderLeft: `4px solid ${meta.color}`,
                }}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <div className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{t.title}</div>
                  <span
                    className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded"
                    style={{ background: `${meta.color}1f`, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                </div>
                <p className="text-xs mb-2" style={{ color: "var(--color-text-tertiary)" }}>{meta.sub}</p>
                <div className="flex items-center gap-3 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  <span>📖 3 passages</span>
                  <span>⏱ 60 phút</span>
                  <span>📝 ~40 câu hỏi</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
