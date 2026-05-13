/**
 * formatTrendDelta — derive the "+0.5 so với lần trước" trend line shown
 * under the band score reveal.
 *
 * Source: `getWritingHistory({ page: 1, limit: 2 })`. Caller passes the
 * fetched submissions array + current submission id. We find the most
 * recent submission OTHER than the current one with a non-null
 * overall_band, then compute the delta.
 *
 * Returns null when:
 *   - currentBand is null
 *   - no prior submission with a band exists
 */

import type { WritingSubmissionSummary } from "@/lib/types";

export type TrendDelta = {
  /** Display-ready label: "+0.5", "-0.5", "= lần trước" */
  label: string;
  /** "up" | "down" | "flat" — drives icon choice in the renderer */
  direction: "up" | "down" | "flat";
};

export function formatTrendDelta(
  currentBand: number | null,
  currentSubmissionId: string,
  history: WritingSubmissionSummary[] | undefined | null,
): TrendDelta | null {
  if (currentBand === null || !history) return null;
  const prior = history.find(
    (s) => s.id !== currentSubmissionId && s.overall_band !== null,
  );
  if (!prior || prior.overall_band === null) return null;

  const delta = Number((currentBand - prior.overall_band).toFixed(1));
  if (delta === 0) {
    return { label: "= lần trước", direction: "flat" };
  }
  const sign = delta > 0 ? "+" : "";
  return {
    label: `${sign}${delta.toFixed(1)} so với lần trước`,
    direction: delta > 0 ? "up" : "down",
  };
}
