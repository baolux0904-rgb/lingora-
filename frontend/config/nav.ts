import type { ComponentType } from "react";
import {
  IconHome,
  IconBook,
  IconMic,
  IconPen,
  IconOpenBook,
  IconHeadphones,
  IconGraduationCap,
  IconSwords,
  IconUsers,
  IconUser,
} from "@/components/Icons";

export type NavSurface = "sidebar" | "bottomnav";

export type NavIcon = ComponentType<{ size?: number; className?: string }>;

export type NavItem = {
  id: string;
  label: string;
  icon: NavIcon;
  /** Real URL when the item is a route (App Router migrated). */
  href?: string;
  /** Legacy tab key when the screen still lives in /home-legacy. Mutually exclusive with href. */
  legacyTab?: string;
  children?: NavItem[];
  showIn: NavSurface[];
  proOnly?: boolean;
  badge?: string;
};

/**
 * Single source of truth for primary navigation.
 *
 * Consumed by:
 *   - AppSidebar   → filter by showIn.includes("sidebar")
 *   - BottomNav    → filter by showIn.includes("bottomnav")
 *
 * Labels intentionally differ per surface (sidebar = English, bottomnav = Vietnamese)
 * to preserve current visual output 1:1. Do not normalise here without design sign-off.
 *
 * href  → item navigates to a real App Router route (migrated in PR2).
 * legacyTab → item still lives as a tab in /home-legacy (Writing/Reading/Speaking/
 *             Listening/Grammar/Scenarios). These move to routes in PR5 alongside
 *             the Mode Selection design. The parent wraps navigation as
 *             /home-legacy?tab={legacyTab}.
 *
 * Known drift preserved from pre-refactor state:
 *   - Grammar / Reading / Writing / Listening / Speaking do NOT appear on bottomnav.
 *     Mobile users reach them through the Exam tab or Home dashboard cards today.
 *     This is tracked in docs/nav-darkmode-research.md §2 and will be addressed in
 *     a later PR when the IELTS-Exam / Learn split lands.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    id: "home",
    label: "Home",
    icon: IconHome,
    href: "/home",
    showIn: ["sidebar", "bottomnav"],
  },
  {
    id: "learn",
    label: "Learn",
    icon: IconBook,
    showIn: ["sidebar"],
    children: [
      { id: "learn-speaking",  label: "Speaking",  icon: IconMic,        legacyTab: "speaking",  showIn: ["sidebar"] },
      { id: "learn-grammar",   label: "Grammar",   icon: IconPen,        legacyTab: "grammar",   showIn: ["sidebar"] },
      { id: "learn-reading",   label: "Reading",   icon: IconOpenBook,   legacyTab: "reading",   showIn: ["sidebar"] },
      { id: "learn-writing",   label: "Writing",   icon: IconPen,        legacyTab: "writing",   showIn: ["sidebar"] },
      { id: "learn-listening", label: "Listening", icon: IconHeadphones, legacyTab: "listening", showIn: ["sidebar"] },
    ],
  },
  {
    id: "exam",
    label: "Thi",
    icon: IconGraduationCap,
    href: "/exam",
    showIn: ["bottomnav"],
  },
  {
    id: "battle",
    label: "Battle",
    icon: IconSwords,
    href: "/battle",
    showIn: ["sidebar", "bottomnav"],
  },
  {
    id: "social",
    label: "Friends",
    icon: IconUsers,
    href: "/friends",
    showIn: ["sidebar", "bottomnav"],
  },
  {
    id: "profile",
    label: "Profile",
    icon: IconUser,
    href: "/profile",
    showIn: ["sidebar", "bottomnav"],
  },
];

/** Label overrides per surface — preserves current Vietnamese labels on bottomnav. */
export const BOTTOMNAV_LABEL_OVERRIDES: Record<string, string> = {
  home: "Trang chủ",
  exam: "Thi",
  battle: "Đấu",
  social: "Bạn bè",
  profile: "Hồ sơ",
};

export function itemsForSurface(surface: NavSurface): NavItem[] {
  return NAV_ITEMS.filter((i) => i.showIn.includes(surface));
}

/** Resolve the destination for a nav item click. */
export function navHref(item: NavItem): string {
  if (item.href) return item.href;
  if (item.legacyTab) return `/home-legacy?tab=${item.legacyTab}`;
  return "/home";
}

/**
 * Derive the active nav item id from the current pathname (+ optional search params).
 *
 * Handles:
 *   /home             → "home"
 *   /exam             → "exam" (sidebar) or "exam" (bottomnav — same id)
 *   /exam/*           → "exam"
 *   /battle           → "battle"
 *   /friends          → "social"
 *   /profile          → "profile"
 *   /writing/progress → "home" (quick link, no dedicated nav item)
 *   /home-legacy?tab=writing → "learn-writing" (sub-nav highlight inside Learn group)
 *   /home-legacy (no tab)    → "home"
 */
export function matchActiveNavId(
  pathname: string,
  searchParams?: URLSearchParams | null,
): string {
  if (pathname === "/home") return "home";
  if (pathname === "/exam" || pathname.startsWith("/exam/")) return "exam";
  if (pathname === "/battle" || pathname.startsWith("/battle/")) return "battle";
  if (pathname === "/friends" || pathname.startsWith("/friends/")) return "social";
  if (pathname === "/profile" || pathname.startsWith("/profile/")) return "profile";
  if (pathname.startsWith("/writing/progress")) return "home";

  if (pathname === "/home-legacy" || pathname.startsWith("/home-legacy")) {
    const tab = searchParams?.get("tab");
    if (!tab) return "home";
    const tabToNav: Record<string, string> = {
      speaking: "learn-speaking",
      writing: "learn-writing",
      reading: "learn-reading",
      listening: "learn-listening",
      grammar: "learn-grammar",
      exam: "exam",
      battle: "battle",
      social: "social",
      friends: "social",
      profile: "profile",
      home: "home",
    };
    return tabToNav[tab] ?? "home";
  }

  return "home";
}
