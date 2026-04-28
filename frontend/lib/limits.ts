/**
 * lib/limits.ts
 *
 * SSR-safe fallback for the public daily-limit surface. The real values
 * come from `GET /api/v1/public/limits` (sourced from
 * `backend/src/domain/limits.js`), but server-rendered marketing pages
 * need a value at first paint before the fetch completes.
 *
 * KEEP IN SYNC WITH `backend/src/domain/limits.js`.
 *   - changing this file alone is a drift bug (the whole point of Wave 2.4
 *     is to *prevent* a "FE says 3, BE enforces 1" gap).
 *   - if the BE constant changes and a deploy ships before the FE rebuilds,
 *     the API response wins and the UI converges within one render.
 */

import type { PublicLimits } from "@/lib/types";

export const PUBLIC_LIMITS_FALLBACK: PublicLimits = {
  free: { speaking: 1, writing: 1, grammar: null, reading: null },
  pro:  { speaking: null, writing: null, grammar: null, reading: null },
};

/**
 * Format "X lần/ngày" or "Không giới hạn" for marketing copy.
 * `null` = unlimited.
 */
export function formatPerDay(perDay: number | null): string {
  return perDay === null ? "Không giới hạn" : `${perDay} lần/ngày`;
}
