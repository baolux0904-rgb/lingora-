"use client";

/**
 * SkillPageShell — Wave 6 Sprint 5C.1 shared layout container.
 *
 * Outer chrome for skill mode-select pages (/exam/<skill>) and any
 * future skill landing surface. Provides:
 *   - Cream canvas (bg-cream per 04-modes/brand.md)
 *   - Mobile Topbar with streak (lg:hidden)
 *   - Animated background (variant per consumer)
 *   - Optional breadcrumb row (← parent · current)
 *   - Title block (font-display Playfair italic per 01-foundations/typography.md)
 *   - Optional subtitle (font-sans neutral)
 *   - Children slot (mode cards / runner content)
 *
 * Per Sprint 5C diagnostic Risk 9 lock: this component is the OUTER
 * container only — no exam-mode opinions, no per-skill UI baked in.
 * Per-skill exam chrome (e.g. WritingExamChrome) lives in each skill's
 * folder and renders inside the children slot.
 *
 * Per Risk 4 lock: file lives at frontend/components/ top-level
 * alongside AppShell.tsx (no shared/ folder yet).
 *
 * Sprint 5D-F will consume this shell for Reading / Grammar / Battle
 * mode-select pages. Sprint 5H.1 may add a `showProgress?: boolean`
 * prop for the band-display widget; out of scope for 5C.1.
 */

import { type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Topbar from "@/components/Topbar";
import { useAppData } from "@/contexts/AppDataContext";

export type SkillKey =
  | "speaking"
  | "writing"
  | "reading"
  | "listening"
  | "grammar"
  | "battle";

export interface BreadcrumbItem {
  label: string;
  /** Omit href on the leaf (current page). */
  href?: string;
}

export interface SkillPageShellProps {
  skillKey: SkillKey;
  /** Visible page title — rendered as font-display Playfair italic. */
  title: string;
  /** Optional secondary line beneath the title. */
  subtitle?: string;
  /** Breadcrumb trail above the title. Last item = current page (omit href). */
  breadcrumb?: BreadcrumbItem[];
  /** AnimatedBackground variant. Defaults to 'minimal' (matches /exam/* pages). */
  bgVariant?: "minimal" | "subtle" | "expressive";
  /** Page body — mode-select cards, runner shell, etc. */
  children: ReactNode;
}

export default function SkillPageShell({
  skillKey,
  title,
  subtitle,
  breadcrumb,
  bgVariant = "minimal",
  children,
}: SkillPageShellProps) {
  const { displayStreak } = useAppData();

  return (
    <div
      data-skill-key={skillKey}
      className="min-h-dvh relative bg-cream"
    >
      <AnimatedBackground variant={bgVariant} />

      {/* Mobile-only Topbar; sidebar replaces it on desktop via AppShell. */}
      <div className="lg:hidden">
        <Topbar streak={displayStreak} />
      </div>

      <div className="mx-auto px-5 py-6 lg:py-10 max-w-2xl lg:max-w-4xl animate-fadeSlideUp">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm text-navy-light mb-4"
          >
            {breadcrumb.map((item, idx) => {
              const isLast = idx === breadcrumb.length - 1;
              return (
                <span key={`${item.label}-${idx}`} className="flex items-center gap-1.5">
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="hover:text-teal transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "text-navy font-medium" : ""}>
                      {item.label}
                    </span>
                  )}
                  {!isLast && (
                    <ChevronRight
                      className="w-3.5 h-3.5 text-navy-light/60"
                      aria-hidden="true"
                    />
                  )}
                </span>
              );
            })}
          </nav>
        )}

        <header className="mb-6 lg:mb-8">
          <h1 className="font-display italic text-navy text-3xl lg:text-4xl leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-base text-navy-light font-sans">
              {subtitle}
            </p>
          )}
        </header>

        {children}
      </div>
    </div>
  );
}
