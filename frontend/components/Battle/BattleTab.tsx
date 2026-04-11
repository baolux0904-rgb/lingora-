"use client";

/**
 * BattleTab.tsx — Main Battle hub.
 *
 * Shows rank, season info, action buttons, recent matches, mini leaderboard.
 * Opens full-screen overlays for queue, match, result, and leaderboard.
 */

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { getBattleHome } from "@/lib/api";
import type { BattleHome, BattleRankTier } from "@/lib/types";

const BattleQueue = dynamic(() => import("./BattleQueue"), { ssr: false });
const BattleMatch = dynamic(() => import("./BattleMatch"), { ssr: false });
const BattleResult = dynamic(() => import("./BattleResult"), { ssr: false });
const BattleLeaderboard = dynamic(() => import("./BattleLeaderboard"), { ssr: false });

// ---------------------------------------------------------------------------
// Rank config
// ---------------------------------------------------------------------------

const RANK_CONFIG: Record<BattleRankTier, { label: string; emoji: string; color: string }> = {
  iron:       { label: "Iron",       emoji: "🪨", color: "#9CA3AF" },
  bronze:     { label: "Bronze",     emoji: "🥉", color: "#CD7F32" },
  silver:     { label: "Silver",     emoji: "🥈", color: "#C0C0C0" },
  gold:       { label: "Gold",       emoji: "🥇", color: "#FFD700" },
  platinum:   { label: "Platinum",   emoji: "💎", color: "#00CED1" },
  diamond:    { label: "Diamond",    emoji: "💠", color: "#B9F2FF" },
  challenger: { label: "Challenger", emoji: "👑", color: "#FF4500" },
};

type Screen = "home" | "queue" | "match" | "result" | "leaderboard";

export default function BattleTab() {
  const [screen, setScreen] = useState<Screen>("home");
  const [data, setData] = useState<BattleHome | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  const loadHome = useCallback(async () => {
    setLoading(true);
    try {
      const home = await getBattleHome();
      setData(home);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadHome(); }, [loadHome]);

  // ---------------------------------------------------------------------------
  // Overlay screens
  // ---------------------------------------------------------------------------

  if (screen === "queue") {
    return (
      <BattleQueue
        onMatched={(matchId) => { setActiveMatchId(matchId); setScreen("match"); }}
        onCancel={() => setScreen("home")}
      />
    );
  }

  if (screen === "match" && activeMatchId) {
    return (
      <BattleMatch
        matchId={activeMatchId}
        onComplete={() => setScreen("result")}
        onClose={() => { setScreen("home"); loadHome(); }}
      />
    );
  }

  if (screen === "result" && activeMatchId) {
    return (
      <BattleResult
        matchId={activeMatchId}
        onClose={() => { setScreen("home"); setActiveMatchId(null); loadHome(); }}
        onPlayAgain={() => setScreen("queue")}
      />
    );
  }

  if (screen === "leaderboard") {
    return <BattleLeaderboard onClose={() => setScreen("home")} />;
  }

  // ---------------------------------------------------------------------------
  // Home screen
  // ---------------------------------------------------------------------------

  const profile = data?.profile;
  const tier = profile?.current_rank_tier || "iron";
  const rankCfg = RANK_CONFIG[tier];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold" style={{ color: "var(--color-text)" }}>
          Battle Arena
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          1v1 Reading Battles — prove your skills
        </p>
      </div>

      {/* Rank Card */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }} />
        </div>
      ) : profile ? (
        <div
          className="rounded-xl p-5 text-center"
          style={{
            background: "linear-gradient(135deg, #0F1E33, #1B2B4B)",
            border: `2px solid ${rankCfg.color}30`,
            boxShadow: `0 0 24px ${rankCfg.color}15`,
          }}
        >
          <div className="text-4xl mb-2">{rankCfg.emoji}</div>
          <div className="text-xl font-display font-bold mb-1" style={{ color: rankCfg.color }}>
            {rankCfg.label}
          </div>
          <div className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
            {profile.current_rank_points} pts {data?.rank ? `• Rank #${data.rank}` : ""}
          </div>
          <div className="flex justify-center gap-6 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            <span><b className="text-green-400">{profile.wins}</b> W</span>
            <span><b className="text-red-400">{profile.losses}</b> L</span>
            <span>{Math.round(profile.wins / Math.max(1, profile.wins + profile.losses) * 100)}% WR</span>
          </div>
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => setScreen("queue")}
          className="w-full py-4 rounded-xl text-base font-bold transition-all active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #00A896, #00C4B0)",
            color: "#fff",
            boxShadow: "0 4px 16px rgba(0,168,150,0.25)",
          }}
        >
          ⚔️ Ranked Match
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => setScreen("queue")}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
            style={{
              background: "var(--color-bg-card)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
            }}
          >
            👥 Challenge Friend
          </button>
          <button
            onClick={() => setScreen("leaderboard")}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
            style={{
              background: "var(--color-bg-card)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
            }}
          >
            🏆 Leaderboard
          </button>
        </div>
      </div>

      {/* Recent Matches */}
      {data && data.recentMatches.length > 0 && (
        <div>
          <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-tertiary)" }}>
            Recent Battles
          </div>
          <div className="flex flex-col gap-2">
            {data.recentMatches.slice(0, 5).map((m) => {
              const isWin = m.winner_user_id === profile?.user_id;
              const isExpired = m.status === "expired";
              return (
                <button
                  key={m.id}
                  onClick={() => { setActiveMatchId(m.id); setScreen("result"); }}
                  className="flex items-center gap-3 p-3 rounded-lg text-left transition-all"
                  style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                    style={{
                      background: isWin ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                      color: isWin ? "#22C55E" : "#EF4444",
                    }}
                  >
                    {isWin ? "W" : isExpired ? "X" : "L"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>
                      {m.passage_title || "Reading Battle"}
                    </div>
                    <div className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                      Score: {Number(m.individual_score).toLocaleString()}
                      {m.rank_delta != null && (
                        <span style={{ color: m.rank_delta >= 0 ? "#22C55E" : "#EF4444", marginLeft: 8 }}>
                          {m.rank_delta >= 0 ? "+" : ""}{m.rank_delta} RP
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    +{m.xp_reward} XP
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mini Leaderboard */}
      {data && data.leaderboardPreview.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
              Top Players
            </span>
            <button onClick={() => setScreen("leaderboard")} className="text-xs font-medium" style={{ color: "#00A896" }}>
              View All
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {data.leaderboardPreview.slice(0, 3).map((e, i) => {
              const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉";
              return (
                <div key={e.user_id} className="flex items-center gap-3 p-2.5 rounded-lg"
                  style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}>
                  <span className="text-base w-6 text-center">{medal}</span>
                  <span className="text-sm font-medium flex-1 truncate" style={{ color: "var(--color-text)" }}>{e.name}</span>
                  <span className="text-xs font-bold" style={{ color: RANK_CONFIG[e.current_rank_tier]?.color || "#9CA3AF" }}>
                    {e.current_rank_points} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
