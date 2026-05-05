"use client";

import { motion, AnimatePresence } from "framer-motion";
import Mascot from "@/components/ui/Mascot";
import { pageEnter, tapScale, tapTransition } from "@/lib/motionVariants";

/**
 * OnboardingGateModal — Wave 6 Sprint 4E.2 reusable soft-gate.
 *
 * 3 call sites (Writing AI / Speaking scenarios start / Battle queue)
 * differ only in headline + body copy. This component owns the
 * cream-canon visual + the two CTAs.
 *
 * Per .claude/skills/lingona-design/02-layout/onboarding-modal.md
 * (NEW Sprint 4E.2): cream surface, mascot top-center, primary CTA
 * + link-style secondary stacked.
 *
 * Skip semantic — see inline note on `onSkip` prop. Skip does NOT
 * call /api/onboarding/complete; the banner persists, AI services
 * fall back to band 5.0 / exam_type 'academic' on null inputs.
 */

export interface OnboardingGateModalProps {
  open: boolean;
  /** Click "Hoàn thiện hồ sơ (30 giây)" — re-open the main onboarding modal. */
  onComplete: () => void;
  /**
   * Click "Bỏ qua" or close (Esc / backdrop). Caller continues to the
   * gated feature. Caller MUST NOT call /api/onboarding/complete here
   * — banner state must persist so the user is reminded later.
   */
  onSkip: () => void;
  /** Headline copy — peer voice, lowercase mình/bạn. */
  headline: string;
  /** Body copy — one sentence, peer voice. */
  body: string;
}

export default function OnboardingGateModal({
  open,
  onComplete,
  onSkip,
  headline,
  body,
}: OnboardingGateModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="gate-backdrop"
            className="fixed inset-0 z-40 bg-navy/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onSkip}
            aria-hidden="true"
          />
          <motion.div
            key="gate-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            variants={pageEnter}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="gate-headline"
              className="pointer-events-auto bg-cream border border-gray-200 rounded-card p-6 sm:p-8 max-w-md w-full shadow-lg flex flex-col items-center text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Mascot size={80} mood="happy" />
              <h2
                id="gate-headline"
                className="mt-4 font-display italic text-navy text-2xl leading-tight"
              >
                {headline}
              </h2>
              <p className="mt-3 text-base text-gray-700 leading-relaxed">
                {body}
              </p>

              <div className="mt-8 w-full flex flex-col gap-3">
                <motion.button
                  type="button"
                  onClick={onComplete}
                  whileTap={tapScale}
                  transition={tapTransition}
                  className="w-full px-6 py-3 rounded-md bg-teal text-cream font-sans font-semibold text-base hover:bg-teal-light active:bg-teal-dark transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                >
                  Hoàn thiện hồ sơ (30 giây)
                </motion.button>
                <button
                  type="button"
                  onClick={onSkip}
                  className="text-sm font-medium text-navy/60 hover:text-teal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-md px-2 py-1"
                >
                  Bỏ qua
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
