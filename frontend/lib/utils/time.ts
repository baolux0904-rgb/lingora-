/**
 * Vietnamese relative time formatter.
 *
 * Output ladder:
 *   - <1 min       → "vừa xong"
 *   - 1-59 min     → "1p" ... "59p"
 *   - Today >1h    → "HH:mm" (e.g. "14:32")
 *   - Yesterday    → "Hôm qua"
 *   - 2-6 days ago → "T2" ... "CN" (Thứ hai, Thứ ba, ..., Chủ nhật)
 *   - >=7 days     → "DD/MM"
 *   - Future / invalid → "vừa xong" (safe fallback)
 *
 * Calendar-day boundary uses local timezone — "Hôm qua" means literally
 * one calendar day before today, not "24 hours ago".
 */

const WEEKDAY_VI_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] as const;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/**
 * Format a date as "tháng M/YYYY" — Vietnamese join-date style.
 * Returns "" for invalid inputs.
 */
export function formatJoinMonth(input: Date | string | null | undefined): string {
  if (!input) return "";
  const date = typeof input === "string" ? new Date(input) : input;
  if (!(date instanceof Date) || isNaN(date.getTime())) return "";
  return `tháng ${date.getMonth() + 1}/${date.getFullYear()}`;
}

export function formatRelativeTime(input: Date | string | null | undefined): string {
  if (!input) return "";
  const date = typeof input === "string" ? new Date(input) : input;
  if (!(date instanceof Date) || isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Future or within 60 seconds → "vừa xong"
  if (diffMs < 60_000) return "vừa xong";

  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 60) return `${diffMin}p`;

  const todayStart = startOfDay(now);
  const dateStart = startOfDay(date);
  const dayDiff = Math.round((todayStart - dateStart) / 86_400_000);

  if (dayDiff === 0) {
    return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  }
  if (dayDiff === 1) return "Hôm qua";
  if (dayDiff >= 2 && dayDiff <= 6) {
    return WEEKDAY_VI_SHORT[date.getDay()];
  }
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}`;
}
