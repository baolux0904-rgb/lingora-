"use client";

/**
 * components/dashboard/WelcomeBanner.tsx — Wave 6 Sprint 3D.
 *
 * Inline welcome banner shown at the top of /home when ?new=1 query is
 * present (set by Sprint 3B Google OAuth callback for first-time signups,
 * and by the rebuilt Register page on email/password signup).
 *
 * Per .claude/skills/lingona-design/:
 * - 02-layout/empty-space-philosophy.md: dashboard banner pattern
 * - 03-components/card-language.md: cream-warm bg + border + rounded-card
 * - 03-components/mascot.md: Lintopus 120px happy
 * - 05-voice/persona.md: peer voice greeting
 * - 06-motion/framer-variants.md: fade in entry, fade+collapse exit
 *
 * User-dismiss only (NO auto-close — industry pattern GitHub/Vercel).
 * localStorage 'lingona-welcome-seen' persists across sessions: once
 * dismissed, never re-shows (even if URL re-acquires ?new=1).
 *
 * Wave 6 Sprint 4.5 (4/5) — sessionStorage persistence layer added
 * between the ?new=1 query trigger and localStorage permanent flag.
 * Bug repro production-verify 2026-05-05: register → /home shows
 * banner → click Profile → back to /home → banner gone (URL no longer
 * carries ?new=1, banner had no way to know it was already shown
 * this session). Fix: when ?new=1 first hits we mark sessionStorage;
 * subsequent /home mounts within the session re-show the banner from
 * the session flag without needing the query param.
 *
 * Caller is responsible for wrapping in <Suspense> if their layout doesn't
 * already provide one — useSearchParams forces client-side rendering.
 */

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Mascot from "@/components/ui/Mascot";
import { useAuthStore } from "@/lib/stores/authStore";

const STORAGE_KEY = "lingona-welcome-seen";          // permanent dismiss
const SESSION_KEY = "lingona-welcome-session-shown"; // current-session active

export default function WelcomeBanner() {
  const router = useRouter();
  const pathname = usePathname() ?? "/home";
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Permanent dismiss wins over everything else.
    if (window.localStorage.getItem(STORAGE_KEY) === "1") {
      // Strip ?new=1 if it's tagging along — the user already met
      // Lintopus on a prior session.
      if (searchParams.get("new") === "1") router.replace(pathname);
      return;
    }

    const queryNew = searchParams.get("new") === "1";
    const sessionActive =
      window.sessionStorage.getItem(SESSION_KEY) === "1";

    // First /home mount of the signup session ?new=1 carries the flag.
    // Promote into sessionStorage so subsequent mounts within the session
    // (e.g. Profile → back to /home) keep the banner visible.
    if (queryNew && !sessionActive) {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    }

    if (queryNew || sessionActive) {
      setVisible(true);
    }
  }, [searchParams, router, pathname]);

  function handleDismiss() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
      window.sessionStorage.removeItem(SESSION_KEY);
    }
    setVisible(false);
    // Wait for the exit animation, then strip the query param so a refresh
    // doesn't re-trigger the (already-seen) gate.
    window.setTimeout(() => router.replace(pathname), 320);
  }

  if (!user) return null;

  // Greeting fallback chain: name (most personal) → username → 'bạn'.
  const greetingName = user.name || user.username || "bạn";

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-cream-warm border border-teal/30 rounded-card p-4 sm:p-6 mb-6 overflow-hidden"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex-shrink-0">
              <Mascot size={120} mood="happy" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display italic text-navy text-xl sm:text-2xl leading-tight">
                Chào {greetingName} 👋 — lần đầu tới Lingona rồi?
              </h2>
              <p className="mt-2 text-sm sm:text-base text-gray-700 leading-relaxed">
                Mình là Lintopus 🐙 — đồng hành cả journey IELTS của bạn. Bắt đầu thử
                1 bài Speaking hoặc Reading.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="flex-shrink-0 self-start p-1 -mr-1 -mt-1 rounded-button text-gray-500 hover:bg-gray-100 transition-colors duration-fast"
              aria-label="Đóng welcome banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
