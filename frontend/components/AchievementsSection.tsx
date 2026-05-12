"use client";

/**
 * AchievementsSection.tsx — Achievement grid with rarity styling,
 * earned/locked states, and category filters.
 */

import { useState, useEffect, useCallback } from "react";
import { Lock } from "lucide-react";
import { getAchievements } from "@/lib/api";
import Skeleton from "@/components/ui/Skeleton";
import type { AchievementsData, BadgeRarity } from "@/lib/types";

const RARITY_CONFIG: Record<string, { border: string; bg: string; glow: string; label: string }> = {
  common:    { border: "rgba(148,163,184,0.3)", bg: "rgba(148,163,184,0.06)", glow: "none", label: "Phổ thông" },
  rare:      { border: "rgba(59,130,246,0.4)", bg: "rgba(59,130,246,0.06)", glow: "0 0 12px rgba(59,130,246,0.15)", label: "Hiếm" },
  epic:      { border: "rgba(139,113,234,0.4)", bg: "rgba(139,113,234,0.06)", glow: "0 0 16px rgba(139,113,234,0.2)", label: "Sử thi" },
  legendary: { border: "rgba(245,158,11,0.5)", bg: "rgba(245,158,11,0.08)", glow: "0 0 20px rgba(245,158,11,0.25)", label: "Huyền thoại" },
};

const CATEGORIES = ["all", "streak", "xp", "speaking", "writing", "reading", "battle", "social", "learning"];

const CATEGORY_LABEL: Record<string, string> = {
  all: "Tất cả",
  streak: "Streak",
  xp: "XP",
  speaking: "Speaking",
  writing: "Writing",
  reading: "Reading",
  battle: "Battle",
  social: "Xã hội",
  learning: "Học tập",
};

export default function AchievementsSection() {
  const [data, setData] = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await getAchievements()); } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Skeleton.List count={2} />;
  if (!data) return null;

  const earnedSlugs = new Set(data.earned.map((b) => b.slug));

  const filteredAll = filter === "all"
    ? data.all_badges
    : data.all_badges.filter((b) => b.category === filter);

  const earned = filteredAll.filter((b) => earnedSlugs.has(b.slug));
  const locked = filteredAll.filter((b) => !earnedSlugs.has(b.slug));
  const displayLocked = showAll ? locked : locked.slice(0, 6);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
            Huy hiệu
          </span>
          <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(139,113,234,0.12)", color: "#A5B4FC" }}>
            {data.achievement_score} điểm
          </span>
        </div>
        <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {data.earned.length}/{data.all_badges.length}
        </span>
      </div>

      {/* Category filter — canonical pill pattern (per scenario-card / friend-list) */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORIES.map((cat) => {
          const isActive = filter === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              aria-pressed={isActive}
              className={[
                "px-4 py-2.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 min-h-[44px]",
                "transition-colors duration-fast",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
                isActive
                  ? "bg-teal text-cream shadow-colored"
                  : "bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[rgba(27,43,75,0.05)] hover:text-[var(--color-text)]",
              ].join(" ")}
            >
              {CATEGORY_LABEL[cat] ?? cat}
            </button>
          );
        })}
      </div>

      {/* Earned badges */}
      {earned.length > 0 && (
        <div>
          <div className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>
            Đã đạt ({earned.length})
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
            {earned.map((b) => {
              const r = RARITY_CONFIG[b.rarity] || RARITY_CONFIG.common;
              const earnedBadge = data.earned.find((e) => e.slug === b.slug);
              return (
                <div
                  key={b.slug}
                  className="relative rounded-xl p-3 flex flex-col items-center gap-1.5 text-center transition-all hover:scale-[1.03]"
                  style={{ background: r.bg, border: `1px solid ${r.border}`, boxShadow: r.glow }}
                >
                  <span
                    className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider"
                    style={{ background: "rgba(0,168,150,0.18)", color: "#00A896" }}
                  >
                    Đã đạt
                  </span>
                  <span className="text-3xl" aria-hidden="true">{b.emoji}</span>
                  <span className="text-xs font-semibold leading-tight" style={{ color: "var(--color-text)" }}>{b.name}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: r.border }}>{r.label}</span>
                  {earnedBadge?.awarded_at && (
                    <span className="text-[11px] tabular-nums" style={{ color: "var(--color-text-tertiary)" }}>
                      {new Date(earnedBadge.awarded_at).toLocaleDateString("vi-VN", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked badges */}
      {locked.length > 0 && (
        <div>
          <div className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-tertiary)" }}>
            Chưa đạt ({locked.length})
          </div>
          <div className="flex flex-col gap-2">
            {displayLocked.map((b) => {
              const r = RARITY_CONFIG[b.rarity] || RARITY_CONFIG.common;
              const prog = data.progress[b.slug];
              return (
                <div
                  key={b.slug}
                  className="relative rounded-lg p-3 flex items-center gap-3"
                  style={{
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="relative shrink-0">
                    <span
                      className="text-2xl block"
                      style={{ filter: "grayscale(1)", opacity: 0.5 }}
                      aria-hidden="true"
                    >
                      {b.emoji}
                    </span>
                    <Lock
                      className="absolute -top-1 -right-1 w-3.5 h-3.5"
                      strokeWidth={2}
                      style={{ color: "var(--color-text-tertiary)" }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>{b.name}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: r.border }}>{r.label}</span>
                    </div>
                    <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{b.description}</span>
                    {prog && (
                      <div className="mt-1.5">
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(27,43,75,0.06)" }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${prog.percent}%`,
                              background: "#00A896",
                              transition: "width 400ms ease-out",
                            }}
                          />
                        </div>
                        <span className="text-xs mt-0.5 block tabular-nums" style={{ color: "var(--color-text-tertiary)" }}>
                          {prog.current}/{prog.target}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--color-text-tertiary)" }}>+{b.achievement_points}</span>
                </div>
              );
            })}
          </div>
          {locked.length > 6 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="text-xs font-medium mt-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded"
              style={{ color: "#00A896" }}
            >
              Xem tất cả {locked.length} huy hiệu chưa đạt →
            </button>
          )}
        </div>
      )}

      {earned.length === 0 && locked.length === 0 && (
        <div className="text-center py-6">
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Chưa có thành tích trong mục này</p>
        </div>
      )}
    </div>
  );
}
