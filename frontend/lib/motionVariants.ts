/**
 * motionVariants.ts — single source of truth for Lingona's framer-motion
 * variants (Wave 6 Sprint 4E.2).
 *
 * Per .claude/skills/lingona-design/06-motion/framer-variants.md:
 * the skill prescribes that consumers import named variants from this
 * module instead of inlining variant objects per component (avoids
 * per-render allocation and drift between similar-but-not-identical
 * inlined values).
 *
 * Sprint 4 cohort (BandGrid, OptionalSection, PresetButtonGroup,
 * OnboardingFlow) inlined their own variants pre-4E.2 because this
 * file didn't exist yet. The 4E.2 commit relocates those variants
 * here verbatim — no behavior change, only consolidation. Where
 * inlined values across components diverged on the "same" semantic
 * pattern (e.g. cell-fade duration 0.2s in BandGrid vs 0.25s in
 * PresetButtonGroup), the 4D-shipped value wins as canonical.
 *
 * Easing canon: ease-out-expo cubic-bezier [0.16, 1, 0.3, 1] across
 * the cohort. Battle drama register lives in 06-motion/battle-card.md
 * and uses its own curve — do not import it from here.
 */

import type { Variants, Transition } from "framer-motion";

/** Canonical Lingona ease-out-expo. */
export const easeOutExpo: Transition["ease"] = [0.16, 1, 0.3, 1];

/**
 * cardEnter — single cell/card appear from below + fade.
 * Used as the child variant inside listStagger (BandGrid cells,
 * PresetButtonGroup chips). 200ms ease-out-expo, 8px y-offset.
 */
export const cardEnter: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: easeOutExpo },
  },
};

/**
 * listStagger — container variant orchestrating cardEnter children.
 * 40ms stagger (tight — 12 cells render in <500ms), 50ms initial delay.
 * Pair with cardEnter on each child.
 */
export const listStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

/**
 * accordionExpand — height 0 ↔ auto + opacity. Wrap parent in
 * `overflow-hidden` (height-auto without overflow flashes the
 * measure-phase content). 300ms height + 200ms opacity, ease-out-expo.
 */
export const accordionExpand: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: easeOutExpo },
      opacity: { duration: 0.2, ease: easeOutExpo },
    },
  },
};

/**
 * pageEnter — page/modal mount appearance. 400ms fade + 8px slide-up.
 * Use for OnboardingFlow modal mount, OnboardingGateModal mount.
 */
export const pageEnter: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOutExpo },
  },
};

/**
 * stepCrossfade — between-step transition inside a multi-step flow.
 * Used in OnboardingFlow Step 1 ↔ Step 2 (NOT a horizontal slide —
 * Lingona prefers stable canvas over carousel feel).
 * 300ms enter, 200ms exit, 4px y-offset.
 */
export const stepCrossfade: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: easeOutExpo },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.2, ease: easeOutExpo },
  },
};

/** Canonical tap micro-interaction. Pair with `whileTap`. */
export const tapScale = { scale: 0.97 };
export const tapTransition: Transition = { duration: 0.15, ease: easeOutExpo };
