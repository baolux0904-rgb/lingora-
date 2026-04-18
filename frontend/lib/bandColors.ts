/**
 * Band score color palette. Enforces Soul rule: band score is never red.
 * Band 4 is still Band 4 — and Lintopus stands next to it.
 *
 * @module lib/bandColors
 */

/**
 * Maps IELTS band (0-9) to hex color.
 * No band gets red. Below 5.0 uses muted slate — dignified, not alarming.
 */
export function bandColor(band: number): string {
  if (band >= 8.0) return "#22C55E";   // emerald — strong
  if (band >= 7.0) return "#00A896";   // teal (brand) — on track
  if (band >= 6.0) return "#0EA5E9";   // sky — approaching target
  if (band >= 5.0) return "#F59E0B";   // amber — improving
  return "#64748B";                     // slate — dignified neutral
}

/**
 * Maps 0-100 score to color via band-equivalent thresholds.
 * Used by ScenarioSummary and IeltsDiagnosticReport which score 0-100.
 */
export function scoreColor(score100: number): string {
  if (score100 >= 85) return "#22C55E";
  if (score100 >= 70) return "#00A896";
  if (score100 >= 55) return "#0EA5E9";
  if (score100 >= 40) return "#F59E0B";
  return "#64748B";
}

/**
 * Text color variant for Tailwind-based contrast.
 */
export function bandTextColor(band: number): string {
  if (band >= 8.0) return "text-emerald-600";
  if (band >= 7.0) return "text-teal-600";
  if (band >= 6.0) return "text-sky-600";
  if (band >= 5.0) return "text-amber-600";
  return "text-slate-500";
}
