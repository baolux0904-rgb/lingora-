import type { ReactNode } from "react";

/**
 * Auth layout — Wave 6 Sprint 3C rebuild.
 *
 * Per .claude/skills/lingona-design/:
 * - 04-modes/brand.md: cream bg + navy text (default brand mode)
 * - 02-layout/desktop-canvas.md: full-canvas Pattern C asymmetric in pages
 * - 09-anti-patterns/ai-generated-smell.md (#7): NO gradient blobs / glow /
 *   dot grid texture (was in legacy layout per Sprint 3A audit)
 *
 * Layout = thin wrapper. Each page (login/register) handles its own
 * Pattern C grid via section structure.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div data-mode="brand" className="min-h-screen bg-cream">
      {children}
    </div>
  );
}
