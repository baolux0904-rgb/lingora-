"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import {
  useOnboardingStatus,
  invalidateOnboardingStatus,
} from "@/lib/hooks/useOnboardingStatus";

/**
 * HomeBanner — Wave 6 Sprint 4E.2 /home resumption banner.
 *
 * Renders when has_completed_onboarding === false (regardless of the
 * has_deferred_onboarding state — both deferred users AND users who
 * never engaged the onboarding modal at all should see the banner).
 * Replaces the deleted OnboardingNudge.tsx.
 *
 * Dismiss is per-session (sessionStorage); the banner reappears next
 * tab/visit so deferred users get periodic nudges without being
 * pestered within a single browsing session.
 *
 * Re-open mechanism: dispatches a window event 'lingona:open-onboarding'.
 * The (app)/layout.tsx listens for this event and flips its
 * setShowOnboarding state. Decoupled from the layout's local state so
 * the banner doesn't have to thread props through 4 components.
 */

const SESSION_KEY = "lingona:home-banner-dismissed";

export default function HomeBanner() {
  const { status, loading } = useOnboardingStatus();
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.sessionStorage.getItem(SESSION_KEY) === "true");
  }, []);

  if (loading || !status) return null;
  if (status.has_completed_onboarding) return null;
  if (dismissed) return null;

  function handleResume() {
    invalidateOnboardingStatus();
    window.dispatchEvent(new Event("lingona:open-onboarding"));
  }

  function handleDismiss() {
    window.sessionStorage.setItem(SESSION_KEY, "true");
    setDismissed(true);
  }

  return (
    <div
      role="region"
      aria-label="Hoàn thiện hồ sơ"
      className="mb-6 lg:mb-8 bg-cream-warm border border-gray-200 rounded-lg p-4 lg:p-5 flex items-start gap-4"
    >
      <div className="flex-shrink-0 hidden sm:block">
        <Image
          src="/mascot.svg"
          alt=""
          width={48}
          height={48}
          className="opacity-90"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-sans font-semibold text-navy text-base">
          Lintopus chưa biết band của bạn
        </p>
        <p className="mt-1 text-sm text-gray-700">
          Mất 30 giây để cá nhân hóa lộ trình học — Lintopus sẽ chấm bài
          chính xác hơn.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleResume}
            className="px-4 py-2 rounded-md bg-teal text-cream font-sans font-medium text-sm hover:bg-teal-light active:bg-teal-dark transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            Hoàn thiện hồ sơ
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Đóng"
        className="flex-shrink-0 p-1 rounded-md text-navy/40 hover:text-navy/70 hover:bg-cream transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
