"use client";

/**
 * OnboardingFlow.tsx — Wave 6 Sprint 4C cream-canon redesign.
 *
 * Per .claude/skills/lingona-design:
 * - 04-modes/brand.md: cream canvas (bg-cream) + navy primary text +
 *   teal accent. NO dark navy background, NO purple-teal gradient
 *   (those were pre-Wave-6 placeholder styling shipped in Wave 2.6).
 * - 01-foundations/typography.md: font-display italic Playfair for
 *   the headline; font-sans DM Sans for body + UI.
 * - 03-components/primary-button.md: bg-teal text-cream rounded-md
 *   (NOT rounded-full — skill module is the source of truth on
 *   button radius), px-6 py-3, hover:bg-teal-light, active:bg-teal-dark.
 * - 03-components/card-language.md: BandGrid cells inherit cream
 *   tokens via mode='cream' (component shipped Sprint 4B).
 * - 03-components/mascot.md: Lintopus 96px in onboarding-intro
 *   register (smaller than landing 240px, larger than badge 32px).
 * - 06-motion/framer-variants.md: page enter (fade + 8px slide-up,
 *   ease-out-expo, 0.4s); step transition via AnimatePresence
 *   crossfade (NOT horizontal slide — Lingona prefers stable canvas
 *   over carousel feel).
 * - 09-anti-patterns/inline-style-rule.md: zero raw style={{...}}
 *   (the previous file had ~10 inline-style hits; all gone).
 * - 09-anti-patterns/jargon-ban.md: no GPT/Whisper/LLM/etc. The
 *   only AI reference is "Lintopus" in the subhead — branded mascot
 *   voice, not implementation.
 * - 05-voice/persona.md: peer voice mình/bạn lowercase, em-dash
 *   rhythm where natural, zero "nhé" (first impression should be
 *   calm + clean, not chatty).
 *
 * Sprint 4C scope (Risk 5 lock):
 * - Step count: 4 → 2. Drops Screen 2 ("Cho Lintopus biết bạn đang
 *   ở đâu" wrapper, no input) AND Screen 4 (post-submit transition
 *   card). The "no pressure" framing moves into the Step 1 subhead.
 * - Step order flipped: now current band FIRST, target band SECOND.
 *   Reasoning: the user picks where they are before they're asked
 *   to declare an aspiration — this matches a natural placement
 *   conversation and lets the Step 2 subhead reference Step 1
 *   ("Lintopus sẽ vẽ lộ trình từ band hiện tại đến đây").
 * - "Bỏ qua" rebranded to "Để sau". Wired client-side only — closes
 *   the modal + navigates; persistence (POST /onboarding/defer +
 *   onboarding_deferred_at column) is Sprint 4E.1 backend +
 *   Sprint 4E.2 frontend.
 *
 * History (kept from Wave 2.6 doc):
 *   Pre-Wave 2.6 there was a 30s mic recording + animated "AI is
 *   analyzing…" screens followed by a band scored as
 *     recordTime >= 20 ? 5.5 + Math.random()*1.5 : 4.5 + Math.random()*1.0.
 *   That number was never persisted — purely a vanity display.
 *   Replaced in Wave 2.6 with an honest self-report dropdown
 *   ("Chưa biết" stores NULL), then in Sprint 4B with BandGrid, then
 *   in Sprint 4C with this cream-canon redesign.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { completeOnboarding, skipOnboarding } from "@/lib/api";
import { analytics } from "@/lib/analytics";
import Mascot from "@/components/ui/Mascot";
import BandGrid from "./BandGrid";

interface OnboardingFlowProps {
  onComplete: () => void;
}

type Step = 1 | 2;
const TOTAL_STEPS = 2;

// Inlined per skill module note — frontend/lib/motionVariants.ts is a
// Sprint 4E.2 deliverable. Once it ships, swap `pageEnter` and
// `stepCrossfade` to imports without touching component logic.
const pageEnter: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

const stepCrossfade: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>(1);
  const [currentBand, setCurrentBand] = useState<number | null>(null);
  const [targetBand, setTargetBand] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleDefer = useCallback(async () => {
    // Sprint 4C — client-side defer only. Closes the modal + navigates
    // back to /home via the parent's onComplete. The legacy
    // skipOnboarding endpoint is still called so layout.tsx's
    // has_completed_onboarding gate doesn't re-prompt on refresh —
    // semantic split between "skipped" and "deferred" is a Sprint 4E
    // backend change.
    // TODO 4E.1: replace skipOnboarding() with a new POST
    //   /api/v1/users/onboarding/defer that sets onboarding_deferred_at
    //   without flipping has_completed_onboarding. The /home banner
    //   (Sprint 4E.2) reads onboarding_deferred_at to decide whether to
    //   prompt resumption.
    try {
      await skipOnboarding();
    } catch {
      /* silent — local defer succeeds even if network drops */
    }
    onComplete();
  }, [onComplete]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await completeOnboarding(targetBand, currentBand);
    } catch {
      /* silent — failure surfaces via the gate re-prompting on next mount */
    }
    analytics.onboardingComplete(targetBand, currentBand);
    setSubmitting(false);
    onComplete();
  }, [targetBand, currentBand, submitting, onComplete]);

  const goToStep2 = useCallback(() => setStep(2), []);
  const goBackToStep1 = useCallback(() => setStep(1), []);

  // Step-1 enables "Tiếp tục" if the user picked a band OR explicitly
  // chose "Chưa biết" (the BandGrid escape cell sets currentBand to
  // null + leaves the cell visually selected). We can't distinguish
  // "user clicked Chưa biết" from "user hasn't touched anything" by
  // value alone — track an explicit interaction flag.
  const [currentTouched, setCurrentTouched] = useState(false);
  const handleCurrentChange = useCallback((band: number | null) => {
    setCurrentBand(band);
    setCurrentTouched(true);
  }, []);
  const step1CanContinue = currentTouched;
  const step2CanSubmit = targetBand !== null && !submitting;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-headline"
      className="fixed inset-0 z-splash bg-cream overflow-y-auto"
      variants={pageEnter}
      initial="hidden"
      animate="visible"
    >
      <div className="min-h-full flex flex-col px-6 py-12 lg:py-16">
        {/* Step indicator — top right */}
        <div className="w-full max-w-[640px] mx-auto flex justify-end">
          <span className="text-sm font-medium text-navy/40 tabular-nums">
            {step} / {TOTAL_STEPS}
          </span>
        </div>

        {/* Mascot intro */}
        <div className="w-full max-w-[640px] mx-auto mt-6 flex justify-center">
          <Mascot size={96} mood="happy" />
        </div>

        {/* Step content — crossfade between steps */}
        <div className="w-full max-w-[640px] mx-auto mt-8 flex-1">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.section
                key="step-1"
                variants={stepCrossfade}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col items-center text-center"
              >
                <h1
                  id="onboarding-headline"
                  className="font-display italic text-navy text-3xl lg:text-4xl leading-tight"
                >
                  Bạn đang ở band nào?
                </h1>
                <p className="mt-3 text-base text-gray-700 max-w-sm">
                  Mình sẽ cá nhân hóa lộ trình theo band hiện tại — cứ chọn gần đúng,
                  bạn có thể đổi sau.
                </p>

                <div className="w-full mt-8">
                  <BandGrid
                    value={currentBand}
                    onChange={handleCurrentChange}
                    showUnknownEscape
                    mode="cream"
                    ariaLabel="Band IELTS hiện tại"
                  />
                </div>

                <div className="w-full max-w-xs mt-10 flex flex-col items-center gap-3">
                  <PrimaryButton
                    onClick={goToStep2}
                    disabled={!step1CanContinue}
                  >
                    Tiếp tục
                  </PrimaryButton>
                  <DeferLink onClick={handleDefer} />
                </div>
              </motion.section>
            )}

            {step === 2 && (
              <motion.section
                key="step-2"
                variants={stepCrossfade}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col items-center text-center"
              >
                <h1
                  id="onboarding-headline"
                  className="font-display italic text-navy text-3xl lg:text-4xl leading-tight"
                >
                  Mục tiêu band của bạn?
                </h1>
                <p className="mt-3 text-base text-gray-700 max-w-sm">
                  {currentBand !== null
                    ? `Lintopus sẽ vẽ lộ trình từ band ${currentBand.toFixed(1)} đến đây.`
                    : "Lintopus sẽ vẽ lộ trình từ band hiện tại đến đây."}
                </p>

                <div className="w-full mt-8">
                  <BandGrid
                    value={targetBand}
                    onChange={setTargetBand}
                    showUnknownEscape={false}
                    mode="cream"
                    ariaLabel="Band IELTS mục tiêu"
                  />
                </div>

                <div className="w-full max-w-xs mt-10 flex flex-col items-center gap-3">
                  <PrimaryButton
                    onClick={handleSubmit}
                    disabled={!step2CanSubmit}
                  >
                    {submitting ? "Đang lưu..." : "Hoàn tất"}
                  </PrimaryButton>
                  <button
                    type="button"
                    onClick={goBackToStep1}
                    className="text-sm font-medium text-navy/50 hover:text-navy transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-md px-2 py-1"
                  >
                    ← Quay lại
                  </button>
                  <DeferLink onClick={handleDefer} />
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/** Primary CTA per 03-components/primary-button.md (rounded-md, NOT rounded-full). */
function PrimaryButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="w-full px-6 py-3 rounded-md bg-teal text-cream font-sans font-semibold text-base hover:bg-teal-light active:bg-teal-dark transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
    >
      {children}
    </motion.button>
  );
}

/** "Để sau" link-style secondary action. */
function DeferLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-medium text-navy/60 hover:text-teal transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-md px-2 py-1"
    >
      Để sau
    </button>
  );
}
