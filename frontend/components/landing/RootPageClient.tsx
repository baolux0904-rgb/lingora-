"use client";

import LandingPage from "./LandingPage";

/**
 * RootPageClient — Wave 6 Sprint 3.5B routing fix (Notion-style landing).
 *
 * `/` always renders <LandingPage /> for guest AND logged-in users. The nav
 * (LandingNav) swaps its CTA based on auth state — guests see Đăng nhập +
 * Đăng ký, logged-in users see a single [Vào học] → /home.
 *
 * Removed prior auto-redirect to /home: it created a stale-user-window race
 * during logout (/ → /home → /login) and violated the Notion-style spec
 * Louis locked in Sprint 3.5A planning.
 */
export default function RootPageClient() {
  return <LandingPage />;
}
