"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Legal layout — Wave 6 Sprint 3.5C-3 commit 1.
 *
 * Doc-style sidebar nav per Stripe Terms / Notion Legal pattern.
 * Hosts 5 sub-pages: Terms / Privacy / Refund / Cookie / Data.
 *
 * Per .claude/skills/lingona-design:
 * - 02-layout/desktop-canvas.md: 12-col grid (sidebar 3-col + content 9-col)
 *   inside max-w-[1120px]
 * - 02-layout/empty-space-philosophy.md: generous breathing room (py-12+,
 *   gap-8 lg:gap-12)
 * - 04-modes/brand.md: cream brand canvas
 * - 05-voice/persona.md voice exception: formal Vietnamese legal language
 *   throughout the legal pages (NOT peer voice). Documented in Sprint 3.5E
 *   skill update.
 *
 * Sidebar sticky on desktop (lg:sticky lg:top-8) so the nav follows the
 * reader as they scroll long sections; collapses inline on mobile.
 */

const LEGAL_NAV = [
  { href: "/legal/terms",   label: "Điều khoản sử dụng" },
  { href: "/legal/privacy", label: "Chính sách bảo mật" },
  { href: "/legal/refund",  label: "Chính sách hoàn tiền" },
  { href: "/legal/cookie",  label: "Chính sách cookie" },
  { href: "/legal/data",    label: "Xử lý dữ liệu" },
] as const;

export default function LegalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div data-mode="brand" className="bg-cream min-h-screen">
      <div className="max-w-[1120px] mx-auto px-6 lg:px-12 xl:px-20 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <nav className="lg:sticky lg:top-8" aria-label="Pháp lý">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-navy hover:text-teal transition-colors duration-150 mb-6"
              >
                ← Về landing
              </Link>
              <h2 className="font-display italic text-navy text-2xl lg:text-3xl mb-4">
                Pháp lý
              </h2>
              <ul className="space-y-1">
                {LEGAL_NAV.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`block px-3 py-2 rounded-button text-sm transition-colors duration-150 ${
                          active
                            ? "bg-teal/10 text-teal font-semibold"
                            : "text-gray-700 hover:bg-gray-50 hover:text-teal"
                        }`}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-500">
                <p>Liên hệ pháp lý:</p>
                <a
                  href="mailto:legal@lingona.app"
                  className="text-teal hover:underline"
                >
                  legal@lingona.app
                </a>
              </div>
            </nav>
          </aside>

          {/* Content */}
          <main className="lg:col-span-9 max-w-[720px]">{children}</main>
        </div>
      </div>
    </div>
  );
}
