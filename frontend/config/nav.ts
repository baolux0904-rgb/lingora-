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
  href?: string;
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
    showIn: ["sidebar", "bottomnav"],
  },
  {
    id: "learn",
    label: "Learn",
    icon: IconBook,
    showIn: ["sidebar"],
    children: [
      { id: "learn-speaking",  label: "Speaking",  icon: IconMic,        showIn: ["sidebar"] },
      { id: "learn-grammar",   label: "Grammar",   icon: IconPen,        showIn: ["sidebar"] },
      { id: "learn-reading",   label: "Reading",   icon: IconOpenBook,   showIn: ["sidebar"] },
      { id: "learn-writing",   label: "Writing",   icon: IconPen,        showIn: ["sidebar"] },
      { id: "learn-listening", label: "Listening", icon: IconHeadphones, showIn: ["sidebar"] },
    ],
  },
  {
    id: "exam",
    label: "Thi",
    icon: IconGraduationCap,
    showIn: ["bottomnav"],
  },
  {
    id: "battle",
    label: "Battle",
    icon: IconSwords,
    showIn: ["sidebar", "bottomnav"],
  },
  {
    id: "social",
    label: "Friends",
    icon: IconUsers,
    showIn: ["sidebar", "bottomnav"],
  },
  {
    id: "profile",
    label: "Profile",
    icon: IconUser,
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
