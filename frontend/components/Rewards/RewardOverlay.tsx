"use client";

/**
 * RewardOverlay.tsx — Global overlay that renders the active reward event.
 *
 * Place this once at the app level (inside RewardProvider).
 * It reads the current event from RewardContext and renders
 * XPToast, BadgeToast, or delegates to LevelUpModal.
 */

import { useReward } from "@/contexts/RewardContext";
import XPToast from "./XPToast";
import BadgeToast from "./BadgeToast";
import LevelUpModal from "@/components/LevelUpModal";

export default function RewardOverlay() {
  const { activeEvent, dismiss } = useReward();

  if (!activeEvent) return null;

  switch (activeEvent.type) {
    case "xp_gain":
      return <XPToast event={activeEvent} onDone={dismiss} />;
    case "badge_unlock":
      return <BadgeToast event={activeEvent} onDone={dismiss} />;
    case "level_up":
      return <LevelUpModal level={activeEvent.newLevel} onClose={dismiss} />;
    default:
      return null;
  }
}
