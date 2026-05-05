"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { cardEnter, listStagger, easeOutExpo } from "@/lib/motionVariants";

/**
 * BandGrid — radio-button grid replacement for the native <select>
 * band picker (Wave 6 Sprint 4B).
 *
 * Per .claude/skills/lingona-design:
 * - 03-components/card-language.md: cell = compact card pattern
 *   (rounded, 1px border, hover = border-color shift only — NO scale).
 * - 06-motion/framer-variants.md: stagger container + child variants
 *   (80ms interval, 100ms initial delay, ease-out-expo). Variants
 *   inlined here because frontend/lib/motionVariants.ts isn't shipped
 *   yet — when that lands, swap to imports without changing visuals.
 * - 09-anti-patterns/inline-style-rule.md: zero raw style={{...}};
 *   all styling via Tailwind utility classes.
 * - 09-anti-patterns/jargon-ban.md: copy is numeric or peer
 *   Vietnamese ("Chưa biết band hiện tại"), no dev terms.
 *
 * Decisions locked Sprint 4B:
 * - 11 band options 4.0 → 9.0 in 0.5 increments (matches IELTS-issued
 *   half-band scale; below 4.0 the user picks "Chưa biết").
 * - Optional 12th cell "Chưa biết band hiện tại" via showUnknownEscape
 *   prop. true on the current-band step, false on target-band step
 *   (a learner always has an aspiration band even if no exam date).
 * - mode='dark' tunes cell contrast for the existing dark-navy
 *   onboarding page; mode='cream' is wired now so Sprint 4C can flip
 *   the page to cream canon without changing this component.
 * - Form state stays on plain useState — value is `number | null`,
 *   onChange receives `number | null`. Component is stateless.
 *
 * a11y:
 * - Wrapper `role="radiogroup"` with optional aria-label.
 * - Each cell `role="radio"` aria-checked, focusable via Tab into the
 *   selected cell (or the first cell when nothing selected) — standard
 *   radio-group keyboard pattern. Browser handles arrow-key focus
 *   movement once tabIndex is wired correctly.
 * - Selected cell tabIndex 0; unselected tabIndex -1. When nothing is
 *   selected, the first cell becomes the entry point (tabIndex 0).
 */

const BANDS: readonly number[] = [
  4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0,
] as const;

export interface BandGridProps {
  /** Currently selected band. null = unknown / not selected. */
  value: number | null;
  /**
   * Called when the user picks a band.
   * Receives null when the user picks "Chưa biết band hiện tại"
   * (only reachable when showUnknownEscape is true).
   */
  onChange: (band: number | null) => void;
  /**
   * Show the 12th "Chưa biết band hiện tại" escape cell.
   * true on the current-band step, false on the target-band step.
   */
  showUnknownEscape: boolean;
  /**
   * Visual mode. 'dark' for the current dark-navy onboarding page,
   * 'cream' for the Sprint 4C cream-canon redesign. Defaults to 'dark'.
   */
  mode?: "dark" | "cream";
  /** aria-label for the radio group. */
  ariaLabel?: string;
}

// Sprint 4E.2 — stagger + cell variants relocated to
// frontend/lib/motionVariants.ts (listStagger + cardEnter). Imported
// above. No behavior change.

export default function BandGrid({
  value,
  onChange,
  showUnknownEscape,
  mode = "dark",
  ariaLabel = "Chọn band IELTS",
}: BandGridProps) {
  const reduce = useReducedMotion();

  // Where Tab lands. When nothing is selected, the first band cell is
  // the entry point so the radio group is reachable. Once a value is
  // picked, the selected cell carries tabIndex.
  const isSelected = (cellValue: number | null) => {
    if (cellValue === null) return value === null && showUnknownEscape;
    return value === cellValue;
  };
  const noSelectionYet = value === null && !showUnknownEscape;

  return (
    <motion.div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-md mx-auto"
      variants={reduce ? undefined : listStagger}
      initial={reduce ? false : "hidden"}
      animate="visible"
    >
      {BANDS.map((band, index) => {
        const selected = isSelected(band);
        const tabIndex = selected || (noSelectionYet && index === 0) ? 0 : -1;
        return (
          <motion.button
            key={band}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={tabIndex}
            onClick={() => onChange(band)}
            className={cellClasses(mode, selected)}
            variants={reduce ? undefined : cardEnter}
            whileTap={reduce ? undefined : { scale: 0.95 }}
            transition={{ duration: 0.15, ease: easeOutExpo }}
            aria-label={`Band ${band.toFixed(1)}`}
          >
            <span className="font-display italic text-2xl leading-none">
              {band.toFixed(1)}
            </span>
          </motion.button>
        );
      })}

      {showUnknownEscape && (
        <motion.button
          key="unknown"
          type="button"
          role="radio"
          aria-checked={value === null}
          tabIndex={value === null ? 0 : -1}
          onClick={() => onChange(null)}
          className={unknownCellClasses(mode, value === null)}
          variants={reduce ? undefined : cardEnter}
          whileTap={reduce ? undefined : { scale: 0.95 }}
          transition={{ duration: 0.15, ease: easeOutExpo }}
          aria-label="Chưa biết band hiện tại"
        >
          <HelpCircle
            className="w-4 h-4 mb-1 opacity-70"
            aria-hidden="true"
          />
          <span className="text-[11px] leading-tight font-medium text-center">
            Chưa biết
            <br />
            band
          </span>
        </motion.button>
      )}
    </motion.div>
  );
}

/**
 * Cell classes by mode + selection. Explicit class strings (no
 * dynamic class concatenation tricks) so Tailwind JIT can pick them up.
 */
function cellClasses(mode: "dark" | "cream", selected: boolean): string {
  const base =
    "aspect-square min-h-[64px] flex items-center justify-center rounded-xl border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  if (mode === "dark") {
    return selected
      ? `${base} bg-teal/15 border-teal text-teal ring-1 ring-teal focus-visible:ring-teal-light focus-visible:ring-offset-navy`
      : `${base} bg-white/5 border-white/10 text-white/80 hover:border-white/30 hover:bg-white/10 focus-visible:ring-teal-light focus-visible:ring-offset-navy`;
  }
  // cream
  return selected
    ? `${base} bg-teal/10 border-teal text-teal ring-1 ring-teal focus-visible:ring-teal-light focus-visible:ring-offset-cream`
    : `${base} bg-cream-warm border-gray-200 text-navy hover:border-teal focus-visible:ring-teal-light focus-visible:ring-offset-cream`;
}

function unknownCellClasses(mode: "dark" | "cream", selected: boolean): string {
  const base =
    "aspect-square min-h-[64px] flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  if (mode === "dark") {
    return selected
      ? `${base} bg-teal/15 border-teal text-teal focus-visible:ring-teal-light focus-visible:ring-offset-navy`
      : `${base} bg-white/5 border-white/20 text-white/70 hover:border-white/40 hover:bg-white/10 focus-visible:ring-teal-light focus-visible:ring-offset-navy`;
  }
  return selected
    ? `${base} bg-teal/10 border-teal text-teal focus-visible:ring-teal-light focus-visible:ring-offset-cream`
    : `${base} bg-cream-warm border-gray-300 text-gray-600 hover:border-teal hover:text-navy focus-visible:ring-teal-light focus-visible:ring-offset-cream`;
}
