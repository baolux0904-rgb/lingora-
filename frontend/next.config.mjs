/**
 * next.config.mjs
 *
 * Key additions for production:
 *
 * 1. API proxy rewrites
 *    -----------------------------------------------------------------
 *    Because the refresh-token cookie is set with SameSite=Strict,
 *    the browser will NOT send it on cross-origin requests.  If the
 *    frontend lives on Vercel (lingora.vercel.app) and the backend on
 *    Railway (api.lingora.up.railway.app) they are different origins.
 *
 *    The fix: proxy every /api/v1/* request through Next.js so the
 *    browser only ever talks to the Vercel origin.  Next.js forwards
 *    the request server-side to BACKEND_URL, and the cookie is sent
 *    because, from the browser's perspective, it is the same origin.
 *
 *    In local dev BACKEND_URL defaults to http://localhost:4000 so
 *    the proxy works identically to production (but isn't strictly
 *    necessary because both run on localhost).
 *
 * 2. withSentryConfig wrapper
 *    Instruments the Next.js build with source-map upload so
 *    Sentry can de-minify stack traces in production.
 *    Safe to call even when SENTRY_AUTH_TOKEN is absent — the upload
 *    step is silently skipped.
 */

import { withSentryConfig } from "@sentry/nextjs";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    formats: ["image/webp"],
    domains: [],
  },

  // ------------------------------------------------------------------
  // API proxy — keeps SameSite=Strict cookie working cross-domain.
  // ------------------------------------------------------------------
  async rewrites() {
    return [
      { source: "/api/v1/:path*", destination: `${BACKEND_URL}/api/v1/:path*` },
      { source: "/health",        destination: `${BACKEND_URL}/health` },
    ];
  },

  // ------------------------------------------------------------------
  // Legacy /home?tab=* URLs → dedicated routes (PR2).
  // Skill tabs (writing/reading/speaking/listening/grammar/scenarios)
  // redirect to /home-legacy temporarily (permanent: false) until PR5
  // migrates their sessions to real routes alongside Mode Selection.
  // ------------------------------------------------------------------
  async redirects() {
    return [
      // Top-level tabs → dedicated routes.
      { source: "/home", has: [{ type: "query", key: "tab", value: "exam" }],     destination: "/exam",    permanent: true },
      { source: "/home", has: [{ type: "query", key: "tab", value: "battle" }],   destination: "/battle",  permanent: true },
      { source: "/home", has: [{ type: "query", key: "tab", value: "social" }],   destination: "/friends", permanent: true },
      { source: "/home", has: [{ type: "query", key: "tab", value: "friends" }],  destination: "/friends", permanent: true },
      { source: "/home", has: [{ type: "query", key: "tab", value: "profile" }],  destination: "/profile", permanent: true },
      // Skill tabs promoted to (app) routes in PR3 (writing/reading/listening Hub; grammar; scenarios).
      { source: "/home", has: [{ type: "query", key: "tab", value: "writing" }],   destination: "/exam/writing",    permanent: true },
      { source: "/home", has: [{ type: "query", key: "tab", value: "reading" }],   destination: "/exam/reading",    permanent: true },
      { source: "/home", has: [{ type: "query", key: "tab", value: "listening" }], destination: "/exam/listening",  permanent: true },
      { source: "/home", has: [{ type: "query", key: "tab", value: "grammar" }],   destination: "/learn/grammar",   permanent: true },
      { source: "/home", has: [{ type: "query", key: "tab", value: "scenarios" }], destination: "/learn/scenarios", permanent: true },
      // Speaking sessions still live in /home-legacy until PR5 (multi-turn state persistence).
      { source: "/home", has: [{ type: "query", key: "tab", value: "speaking" }],  destination: "/home-legacy?tab=speaking", permanent: false },
      // Also redirect /home-legacy Hub/listing tabs to the new (app) routes.
      { source: "/home-legacy", has: [{ type: "query", key: "tab", value: "writing" }],   destination: "/exam/writing",    permanent: true },
      { source: "/home-legacy", has: [{ type: "query", key: "tab", value: "reading" }],   destination: "/exam/reading",    permanent: true },
      { source: "/home-legacy", has: [{ type: "query", key: "tab", value: "listening" }], destination: "/exam/listening",  permanent: true },
      { source: "/home-legacy", has: [{ type: "query", key: "tab", value: "grammar" }],   destination: "/learn/grammar",   permanent: true },

      // Wave 6 Sprint 3.5C-3 commit 2 — legacy legal route redirects.
      // 308 permanent for SEO + bookmark preservation. Sources mapped from
      // routes that actually had a legacy page.tsx file (per Phase 1 audit):
      //   - frontend/app/(legal)/data-deletion → URL /data-deletion
      //   - frontend/app/(legal)/privacy       → URL /privacy
      // The dead /terms and /refund Footer links from Sprint 2E never had
      // backing pages — Footer is fixed in this same commit, no redirect
      // needed.
      { source: "/data-deletion", destination: "/legal/data",    permanent: true },
      { source: "/privacy",       destination: "/legal/privacy", permanent: true },
    ];
  },
};

// Wrap with Sentry only when NEXT_PUBLIC_SENTRY_DSN is set so that
// local development stays fast (no source-map upload overhead).
export default withSentryConfig(nextConfig, {
  // Suppresses the Sentry build-time output (useful for CI logs).
  silent: true,

  // Upload source maps to Sentry for readable production stack traces.
  // Requires SENTRY_AUTH_TOKEN + SENTRY_PROJECT + SENTRY_ORG to be set
  // in the CI/Vercel environment.  Silently skipped if absent.
  widenClientFileUpload: true,

  // Hides Sentry's edge-runtime warning — we initialise it manually.
  hideSourceMaps: true,

  // Disable the automatic instrumentation of the Next.js router so we
  // control exactly what gets traced.
  disableLogger: true,
});
