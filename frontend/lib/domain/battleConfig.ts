/**
 * frontend/lib/domain/battleConfig.ts
 *
 * Mirror of backend/src/domain/battleConfig.js, plus the FE-only
 * presentation map (RANK_CONFIG: label/emoji/color). Keeps the three
 * battle components from drifting on rank visuals — historically they
 * each maintained their own RANK_CONFIG copy, which is exactly the
 * kind of surface that drifts when one screen gets a redesign and the
 * others don't.
 *
 * BE/FE values must stay in sync. Until we land a shared schema
 * package (Wave 6 conversation), the canonical numbers live here and
 * in domain/battleConfig.js — when one moves, both move.
 */

export const PRACTICE_GATE = 5;

export const SUBMISSION_DEADLINE_MINUTES = 30;

export const RANK_TIERS = [
  { name: "iron",       minPoints: 0 },
  { name: "bronze",     minPoints: 200 },
  { name: "silver",     minPoints: 400 },
  { name: "gold",       minPoints: 700 },
  { name: "platinum",   minPoints: 1000 },
  { name: "diamond",    minPoints: 1400 },
  { name: "challenger", minPoints: 1800 },
] as const;

export type RankName = (typeof RANK_TIERS)[number]["name"];

export interface RankVisual {
  label: string;
  emoji: string;
  color: string;
}

export const RANK_CONFIG: Record<RankName, RankVisual> = {
  iron:       { label: "Iron",       emoji: "🪨", color: "#9CA3AF" },
  bronze:     { label: "Bronze",     emoji: "🥉", color: "#CD7F32" },
  silver:     { label: "Silver",     emoji: "🥈", color: "#C0C0C0" },
  gold:       { label: "Gold",       emoji: "🥇", color: "#FFD700" },
  platinum:   { label: "Platinum",   emoji: "💎", color: "#00CED1" },
  diamond:    { label: "Diamond",    emoji: "💠", color: "#B9F2FF" },
  challenger: { label: "Challenger", emoji: "👑", color: "#FF4500" },
};
