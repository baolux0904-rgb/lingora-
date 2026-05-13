"use client";

/**
 * BandScoreReveal — giant 88px Playfair italic band score + trend line.
 * Mobile: scales to 64px.
 */

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/time";
import type { TrendDelta } from "./utils/formatTrendDelta";

interface BandScoreRevealProps {
  band: number | null;
  scoredAt: string;
  trend: TrendDelta | null;
}

export default function BandScoreReveal({ band, scoredAt, trend }: BandScoreRevealProps) {
  return (
    <header className="my-8">
      <div
        className="text-[11px] uppercase tracking-[0.16em] mb-3"
        style={{ color: "rgba(0, 168, 150, 0.7)" }}
      >
        Đã chấm xong{" "}
        <span style={{ color: "var(--color-text-tertiary)", letterSpacing: "0.1em" }}>
          · {formatRelativeTime(scoredAt)}
        </span>
      </div>
      <div className="flex items-baseline gap-6 flex-wrap">
        <div
          className="font-display italic leading-none tabular-nums tracking-tight text-[64px] sm:text-[88px]"
          style={{ color: "var(--color-text)" }}
        >
          {band !== null ? band.toFixed(1) : "—"}
        </div>
        <div className="flex flex-col gap-1 pb-3">
          <div className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
            Band tổng
          </div>
          {trend && (
            <div
              className="text-[13px] flex items-center gap-1"
              style={{
                color:
                  trend.direction === "up"
                    ? "#00A896"
                    : trend.direction === "down"
                      ? "#EF4444"
                      : "var(--color-text-secondary)",
              }}
            >
              {trend.direction === "up" && (
                <TrendingUp className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              )}
              {trend.direction === "down" && (
                <TrendingDown className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              )}
              {trend.direction === "flat" && (
                <Minus className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              )}
              {trend.label}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
