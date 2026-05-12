"use client";

import { useState, useEffect } from "react";
import AppSidebar from "./AppSidebar";
import BottomNav from "./BottomNav";
import { useSidebar } from "@/contexts/SidebarContext";
import type { GamificationData, BattleRankTier } from "@/lib/types";

interface AppShellProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (id: string) => void;
  gamification: GamificationData | null;
  rankTier?: BattleRankTier;
  userName?: string;
  /** Fallback streak when gamification hasn't loaded */
  displayStreak?: number;
  /** Hide navigation entirely (used during overlays like grammar, onboarding) */
  hideNav?: boolean;
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isDesktop;
}

export default function AppShell({
  children,
  activeTab,
  onTabChange,
  gamification,
  rankTier,
  userName,
  displayStreak,
  hideNav = false,
}: AppShellProps) {
  const isDesktop = useIsDesktop();
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();

  const desktopWidthVar = collapsed
    ? "var(--sidebar-width-collapsed)"
    : "var(--sidebar-width)";

  return (
    <div className="min-h-dvh relative bg-deep-gradient noise-overlay">
      {/* Desktop sidebar rail */}
      {!hideNav && isDesktop && (
        <AppSidebar
          mode="desktop-rail"
          active={activeTab}
          onChange={onTabChange}
          gamification={gamification}
          rankTier={rankTier}
          userName={userName}
          displayStreak={displayStreak}
        />
      )}

      {/* Mobile overlay sidebar */}
      {!hideNav && !isDesktop && mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 motion-reduce:transition-none"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <AppSidebar
            mode="mobile-overlay"
            active={activeTab}
            onChange={onTabChange}
            gamification={gamification}
            rankTier={rankTier}
            userName={userName}
            displayStreak={displayStreak}
          />
        </>
      )}

      {/* Main content */}
      <main
        className="min-h-dvh overflow-y-auto motion-reduce:transition-none"
        style={{
          marginLeft: !hideNav && isDesktop ? desktopWidthVar : 0,
          paddingBottom: !hideNav && !isDesktop ? 68 : 0,
          transition: "margin-left 200ms ease-out",
        }}
      >
        <div className="relative z-10">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      {!hideNav && !isDesktop && (
        <BottomNav active={activeTab} onChange={onTabChange} />
      )}
    </div>
  );
}
