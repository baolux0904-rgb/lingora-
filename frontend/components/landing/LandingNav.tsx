"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/stores/authStore";

/**
 * LandingNav — Wave 6 Sprint 2E rebuild.
 *
 * Per .claude/skills/lingona-design:
 * - 02-layout/desktop-canvas.md: 1120px container + functional nav layout
 * - 02-layout/mobile-rhythm.md: mobile collapse to logo + CTAs (menu items
 *   hidden below md; full mobile sheet defer Sprint 9 polish)
 * - 03-components/primary-button.md: teal Register CTA, secondary Login text
 * - 04-modes/brand.md: cream bg + navy text + DM Sans
 * - 05-voice/microcopy-library.md: Vietnamese peer voice (Đăng nhập, Đăng ký)
 * - 09-anti-patterns/desktop-waste.md: functional nav (4 menu items, NOT sparse)
 * - 09-anti-patterns/ai-generated-smell.md: NO glassmorphism backdrop-blur
 *
 * STATIC scroll behavior per Louis decision (NOT sticky) — nav scrolls
 * away naturally with page content.
 *
 * Filename retained as LandingNav.tsx (NOT renamed to Nav.tsx per spec)
 * to avoid touching LandingPage.tsx import. Identical content per spec.
 */

const NAV_ITEMS = [
  { label: "Về Lingona", href: "/about" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Help", href: "/help" },
] as const;

export default function LandingNav() {
  // Wave 6 Sprint 3.5B — auth-conditional CTAs (Notion-style landing). Guests
  // see Đăng nhập + Đăng ký; logged-in users see a single [Vào học] → /home.
  // A skeleton placeholder fills the slot during the brief auth-hydration
  // window so the CTA doesn't flicker between states.
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  return (
    <nav className="bg-cream border-b border-gray-200">
      <div className="max-w-[1120px] mx-auto px-6 lg:px-12 xl:px-20 py-4 flex items-center justify-between gap-6">
        {/* Logo wordmark — Playfair Italic per typography.md */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          aria-label="Lingona — về trang chủ"
        >
          <span className="font-display italic text-navy text-2xl group-hover:text-teal transition-colors duration-150">
            Lingona
          </span>
        </Link>

        {/* Menu items — desktop only (md+) */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-sm text-navy hover:text-teal transition-colors duration-150"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth-conditional CTAs (Sprint 3.5B) */}
        <div className="flex items-center gap-3 lg:gap-4">
          {isLoading ? (
            <div
              className="w-32 h-9 rounded-button bg-gray-100 animate-pulse"
              aria-hidden="true"
            />
          ) : user ? (
            <Link
              href="/home"
              className="inline-flex items-center px-5 py-2 rounded-button bg-teal text-cream font-semibold text-sm hover:bg-teal-light active:bg-teal-dark transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Vào học
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex text-sm text-navy hover:text-teal transition-colors duration-150"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center px-4 py-2 rounded-button bg-teal text-cream font-semibold text-sm hover:bg-teal-light active:bg-teal-dark transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
