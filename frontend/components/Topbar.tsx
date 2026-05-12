"use client";

// Sprint 5K execute — useRouter dropped along with the /leaderboard
// trophy button (root /leaderboard page deleted).
import { Menu } from "lucide-react";
import { IconFire } from "./Icons";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./Social/NotificationBell";
import Mascot from "@/components/ui/Mascot";
import { useAuthStore } from "@/lib/stores/authStore";
import { useSidebar } from "@/contexts/SidebarContext";

interface TopbarProps {
  streak?: number;
}

export default function Topbar({ streak = 0 }: TopbarProps) {
  const user = useAuthStore((s) => s.user);
  const { setMobileOpen } = useSidebar();
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <header
      className="h-16 px-5 flex items-center justify-between gap-4 flex-shrink-0"
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {/* Left — Hamburger + Streak badge */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Mở menu"
          className="lg:hidden w-11 h-11 rounded-md flex items-center justify-center transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-card)] hover:bg-[var(--color-bg-hover)]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <Menu className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
        </button>

        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.08))",
            border: "1px solid rgba(245,158,11,0.2)",
            color: "#F59E0B",
            ...(streak > 0 ? { boxShadow: "0 0 10px rgba(245,158,11,0.2)" } : {}),
          }}
        >
          <span
            className="inline-flex"
            style={streak > 0 ? { animation: "streakPulse 2s ease-in-out infinite" } : undefined}
          >
            <IconFire className="text-amber-500" />
          </span>
          <span className="text-base font-semibold">{streak}</span>
          <span className="text-xs font-medium opacity-80">Day{streak !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Center — Brand with mascot logomark */}
      <div className="flex items-center gap-2">
        <Mascot size={28} />
        <span
          className="font-display font-bold text-lg tracking-tighter"
          style={{ color: "var(--color-text)" }}
        >
          Lingona
        </span>
      </div>

      {/* Right — Theme + Avatar (Sprint 5K execute dropped the
          /leaderboard trophy button along with the root page; Battle
          subsystem covers ranking. Future global ranking ships
          standalone Sprint 5+ if needed.) */}
      <div className="flex items-center gap-2.5">
        {/* Leaderboard icon removed — see Sprint 5K execute commit. */}
        <NotificationBell />
        <ThemeToggle />
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-sans font-semibold text-xs text-white"
          style={{
            background: "linear-gradient(135deg, #1B2B4B, #2D4A7A)",
            border: "2px solid rgba(0, 168, 150, 0.3)",
          }}
        >
          {initials}
        </div>
      </div>
      {streak > 0 && (
        <style>{`
          @keyframes streakPulse {
            0%, 100% { transform: scale(1); }
            50%      { transform: scale(1.15); }
          }
        `}</style>
      )}
    </header>
  );
}
