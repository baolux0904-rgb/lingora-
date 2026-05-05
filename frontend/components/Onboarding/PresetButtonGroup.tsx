"use client";

import { motion } from "framer-motion";

/**
 * PresetButtonGroup — chip-style preset picker. Generic over T so the
 * parent owns the value union (e.g. ExamDateBucket, StudyHoursBucket,
 * 'academic' | 'general').
 *
 * Per .claude/skills/lingona-design:
 * - 03-components/card-language.md: cell = compact card pattern,
 *   border-color shift on hover (no scale).
 * - 03-components/primary-button.md: rounded-md primary radius (NOT
 *   rounded-full — pill is reserved for chip-style tag actions like
 *   "+ Mời bạn", not for form pickers).
 * - 09-anti-patterns/inline-style-rule.md: zero raw style={{...}}.
 *
 * Cream-context only — Sprint 4D consumers (OptionalSection inside
 * Step 2) all render on bg-cream. A 'mode' prop can be added later if
 * a dark consumer surfaces.
 *
 * Layout: flex-wrap row of chip buttons. Mobile-friendly tap targets
 * (min height 40px via py-2 + text-sm = 40px).
 */

export interface PresetOption<T extends string> {
  value: T;
  label: string;
}

export interface PresetButtonGroupProps<T extends string> {
  /** Question label rendered above the chip row. */
  label: string;
  /** 2–5 typical. Component renders flex-wrap; no explicit cap. */
  options: PresetOption<T>[];
  /** Currently picked value. null = nothing picked yet. */
  value: T | null;
  /** Called when the user picks an option. No null — to clear, the
   *  consumer must provide an explicit "clear" option in `options`. */
  onChange: (value: T) => void;
  /** Override aria-label on the radio group. Defaults to `label`. */
  ariaLabel?: string;
}

export default function PresetButtonGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  ariaLabel,
}: PresetButtonGroupProps<T>) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="text-sm font-medium text-navy mb-2 block">
        {label}
      </legend>
      <div
        role="radiogroup"
        aria-label={ariaLabel ?? label}
        className="flex flex-wrap gap-2"
      >
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <motion.button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className={chipClasses(selected)}
            >
              {opt.label}
            </motion.button>
          );
        })}
      </div>
    </fieldset>
  );
}

function chipClasses(selected: boolean): string {
  const base =
    "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream";
  return selected
    ? `${base} bg-teal/10 border border-teal text-teal ring-1 ring-teal`
    : `${base} bg-cream-warm border border-gray-200 text-navy hover:border-teal hover:bg-cream`;
}
