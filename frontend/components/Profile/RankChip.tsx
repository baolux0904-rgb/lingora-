/**
 * RankChip — tier name + Lucide icon, pure-palette (no multi-color
 * tier deviation). Per Session 4 decision Q2.
 *
 * Source of truth for tier `label` is RANK_CONFIG in
 * frontend/lib/domain/battleConfig.ts. RANK_CONFIG.emoji is the
 * historical visual; profile-stats canon uses Lucide icons here for
 * editorial consistency with the 8-stat grid. RANK_CONFIG stays
 * untouched as cross-component canon for Battle screens.
 */

import { Shield, Award, Medal, Star, Gem, Diamond, Crown, type LucideIcon } from "lucide-react";
import { RANK_CONFIG, type RankName } from "@/lib/domain/battleConfig";

const TIER_ICON: Record<RankName, LucideIcon> = {
  iron: Shield,
  bronze: Award,
  silver: Medal,
  gold: Star,
  platinum: Gem,
  diamond: Diamond,
  challenger: Crown,
};

function normalizeTier(raw: string | null | undefined): RankName {
  const cleaned = (raw ?? "iron").replace(/^'|'$/g, "").toLowerCase() as RankName;
  return cleaned in TIER_ICON ? cleaned : "iron";
}

export default function RankChip({ tier }: { tier: string | null | undefined }) {
  const safeTier = normalizeTier(tier);
  const Icon = TIER_ICON[safeTier];
  const label = RANK_CONFIG[safeTier].label;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{
        background: "rgba(27, 43, 75, 0.08)",
        color: "var(--color-text)",
      }}
      aria-label={`Hạng ${label}`}
    >
      <Icon className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
