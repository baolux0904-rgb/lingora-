"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/* ══════════════════════════════════════════════════════════════════════
   Mascot — Lingona's Lintopus character
   ══════════════════════════════════════════════════════════════════════
   Per .claude/skills/lingona-design/03-components/mascot.md (Wave 6 Sprint 2B):
   - 4 mood states (default / happy / thinking / sad) via CSS filter
   - size prop (24-320px), default 80
   - bubble prop (optional 1-line peer voice, max ~80 chars)
   - bubblePosition (right / below)
   - enableIdle (subtle breath loop, hero only — disabled mobile + reduced-motion)
   - greeting (single arm-wave fade-in on mount)
   - priority (LCP optimization for above-fold use)

   SVG protection R1: frontend/public/mascot.svg is UNTOUCHED. Mood states
   implemented via CSS filter on the wrapper, NOT separate SVG variants.

   Compatibility: existing call sites use `<Mascot size={N} mood="..." className="..." />`
   — all preserved. New props (bubble/bubblePosition/enableIdle/greeting/priority) opt-in.

   Usage:
     <Mascot size={80} />
     <Mascot size={120} mood="happy" />
     <Mascot size={320} mood="happy" enableIdle priority />
     <Mascot size={120} mood="default" bubble="Vững rồi đấy" />
   ══════════════════════════════════════════════════════════════════════ */

export type MascotMood = "default" | "happy" | "thinking" | "sad";

interface MascotProps {
  /** Size in pixels (width & height), recommend 24-320 */
  size?: number;
  /** Mood — applies subtle CSS filter overlay, no SVG file change */
  mood?: MascotMood;
  /** Optional 1-line peer-voice bubble text (≤80 chars). See 05-voice/lintopus-bubble-text.md */
  bubble?: string;
  /** Bubble layout: 'below' (vertical stack, default) or 'right' (horizontal) */
  bubblePosition?: "below" | "right";
  /** Subtle breath idle loop (4s scale 1→1.02→1). Hero-only, opt-in. Disabled mobile + reduced-motion. */
  enableIdle?: boolean;
  /** Arm-wave fade-in on mount (welcome moments only, single pass) */
  greeting?: boolean;
  /** Mark as priority for LCP (use on above-fold hero) */
  priority?: boolean;
  /** Additional CSS classes on the outer container */
  className?: string;
  /** Inline styles on the SVG wrapper */
  style?: React.CSSProperties;
  /** Alt text for accessibility */
  alt?: string;
}

const moodFilter: Record<MascotMood, string | undefined> = {
  default: undefined,
  happy: "brightness(1.05) saturate(1.1)",
  thinking: "brightness(0.98)",
  sad: "brightness(0.92) saturate(0.85)",
};

const Mascot: React.FC<MascotProps> = ({
  size = 80,
  mood = "default",
  bubble,
  bubblePosition = "below",
  enableIdle = false,
  greeting = false,
  priority = false,
  className = "",
  style,
  alt = "Lintopus",
}) => {
  const filter = moodFilter[mood];

  // Greeting = single fade+scale enter; idle = looping breath via CSS class
  const initialAnim = greeting
    ? { opacity: 0, scale: 0.92, y: 8 }
    : { opacity: 1, scale: 1, y: 0 };

  const containerLayout =
    bubble && bubblePosition === "right"
      ? "inline-flex flex-row items-end gap-3"
      : bubble
      ? "inline-flex flex-col items-center gap-3"
      : "inline-block";

  return (
    <div
      className={`${containerLayout} ${className}`}
      data-mascot
      data-mood={mood}
    >
      <motion.span
        initial={initialAnim}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`inline-block ${enableIdle ? "mascot-breath" : ""}`}
        aria-label={alt}
        role="img"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
      >
        {/* SVG asset untouched — mood filter applied on the element direct.
            Hybrid render: next/image when priority=true (LCP-critical above-fold use,
            ~1-2 callers like landing Hero); plain <img> otherwise (24 existing callers
            backward-compat, no Next.js Image SVG quirks). */}
        {priority ? (
          <Image
            src="/mascot.svg"
            alt={alt}
            width={size}
            height={size}
            priority
            className="select-none pointer-events-none"
            style={{
              width: size,
              height: size,
              objectFit: "contain",
              filter,
              transition: "filter 0.3s ease-out",
              ...style,
            }}
            draggable={false}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src="/mascot.svg"
            alt={alt}
            width={size}
            height={size}
            className="select-none pointer-events-none"
            style={{
              width: size,
              height: size,
              objectFit: "contain",
              filter,
              transition: "filter 0.3s ease-out",
              ...style,
            }}
            draggable={false}
          />
        )}
      </motion.span>

      {bubble && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
          className="text-sm text-gray-700 max-w-[220px] text-center font-medium leading-snug"
        >
          {bubble}
        </motion.p>
      )}
    </div>
  );
};

export default Mascot;
export { Mascot };
