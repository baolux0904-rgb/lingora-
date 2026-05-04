"use client";

/**
 * (app) route group layout.
 *
 * Hosts every authenticated route that renders inside the shared shell
 * (sidebar + bottomnav). Anything requiring a fullscreen/no-shell layout
 * (active Writing/Reading/Speaking session, etc.) currently still lives
 * under /home-legacy and will be migrated in PR5 when the Mode Selection
 * design locks the session state contract.
 *
 * Responsibilities:
 *   - Auth guard: redirect unauthenticated users to /login
 *   - Onboarding gate: block routes until the 6-screen flow completes
 *   - RewardProvider + RewardOverlay for XP / level-up / badge toasts
 *   - AppShell with sidebar + bottomnav
 *   - AppDataProvider — runs shared hooks ONCE at the layout boundary;
 *     intra-group navigation reuses the same React tree, so hooks do not
 *     re-fire. No SWR required for this scope.
 *   - Active nav id derived from usePathname + searchParams via
 *     matchActiveNavId(), preserving highlight when users hit /home-legacy
 *     URLs that still exist for Writing/Reading/Speaking/Listening/Grammar/
 *     Scenarios.
 */

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import AppShell from "@/components/AppShell";
import { AppDataProvider, useAppData } from "@/contexts/AppDataContext";
import { RewardProvider } from "@/contexts/RewardContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { PresenceProvider } from "@/contexts/PresenceContext";
import RewardOverlay from "@/components/Rewards/RewardOverlay";
import StreakMilestoneHandler from "@/components/Rewards/StreakMilestoneHandler";
import { useAuthStore } from "@/lib/stores/authStore";
import { getOnboardingStatus } from "@/lib/api";
import { matchActiveNavId, NAV_ITEMS, navHref } from "@/config/nav";
import type { NavItem } from "@/config/nav";

const OnboardingFlow = dynamic(
  () => import("@/components/Onboarding/OnboardingFlow"),
  { ssr: false },
);

// Wave 6 Sprint 3D — full-screen blocking modal forces NULL-username users
// to pick before any authenticated route renders. Dynamic + ssr:false so
// it never appears in SSR output (client-only gate).
const UsernameBackfillModal = dynamic(
  () => import("@/components/auth/UsernameBackfillModal"),
  { ssr: false },
);

function findNavItem(id: string, items: NavItem[] = NAV_ITEMS): NavItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findNavItem(id, item.children);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Shell inner — consumes AppData + Auth + routes nav clicks.
 * Separated so it can call useAppData() inside the Provider.
 */
function AppShellInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { gamification, rankTier, displayStreak } = useAppData();

  const activeTab = matchActiveNavId(pathname ?? "/home", searchParams);

  const handleTabChange = (id: string) => {
    // Sidebar footer gear emits "settings" — route to the PR6 Settings page.
    if (id === "settings") {
      router.push("/settings");
      return;
    }
    const item = findNavItem(id);
    if (!item) {
      router.push("/home");
      return;
    }
    router.push(navHref(item));
  };

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={handleTabChange}
      gamification={gamification}
      rankTier={rankTier}
      userName={user?.name}
      displayStreak={displayStreak}
    >
      {children}
      <StreakMilestoneHandler streak={gamification?.streak} />
    </AppShell>
  );
}

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: authLoading } = useAuthStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  // Auth guard — redirect unauthenticated users to /login once AuthProvider
  // settles. Sprint 3.5B: preserve the intended destination as ?redirect=
  // so the login flow can return the user there after success (e.g. someone
  // clicking a deep link to /battle gets bounced to /login?redirect=/battle
  // and lands back on /battle once authenticated).
  useEffect(() => {
    if (!authLoading && !user) {
      const target = pathname && pathname !== "/login" ? pathname : "/home";
      router.replace(`/login?redirect=${encodeURIComponent(target)}`);
    }
  }, [authLoading, user, pathname, router]);

  // Onboarding check — global gate, not tab-specific.
  useEffect(() => {
    if (!user || onboardingChecked) return;
    getOnboardingStatus()
      .then((status) => {
        if (!status.has_completed_onboarding) setShowOnboarding(true);
      })
      .catch(() => {})
      .finally(() => setOnboardingChecked(true));
  }, [user, onboardingChecked]);

  if (authLoading || !user) return null;

  // Wave 6 Sprint 3D — username backfill gate. Block every authenticated
  // route until the legacy NULL-username cohort picks a value. Sits before
  // the onboarding gate so name + username get sorted first; once
  // patchUser populates user.username this layout re-renders and
  // OnboardingFlow / AppShell take over.
  if (!user.username) {
    return <UsernameBackfillModal />;
  }

  if (showOnboarding) {
    return (
      <RewardProvider>
        <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
      </RewardProvider>
    );
  }

  return (
    <RewardProvider>
      <AppDataProvider>
        <SocketProvider>
          <PresenceProvider>
            <Suspense>
              <AppShellInner>{children}</AppShellInner>
            </Suspense>
            <RewardOverlay />
          </PresenceProvider>
        </SocketProvider>
      </AppDataProvider>
    </RewardProvider>
  );
}
