"use client";

/**
 * WritingSelfCompareBanner — thin strip that compares the current
 * submission's band against the user's previous-month avg. Silent when
 * the user has no prior submissions (no comparison possible).
 */

import { useEffect, useState } from "react";
import { getWritingSelfCompare } from "@/lib/api";
import type { WritingSelfCompare } from "@/lib/types";

interface WritingSelfCompareBannerProps {
  currentBand: number | null;
}

function arrow(delta: number | null) {
  if (delta == null || Math.abs(delta) < 0.1) return { icon: "➡️", color: "var(--color-text-secondary)" };
  if (delta > 0) return { icon: "⬆️", color: "#16A34A" };
  return { icon: "⬇️", color: "#EF4444" };
}

export default function WritingSelfCompareBanner({ currentBand }: WritingSelfCompareBannerProps) {
  const [data, setData] = useState<WritingSelfCompare | null>(null);

  useEffect(() => {
    let cancelled = false;
    getWritingSelfCompare()
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setData(null); });
    return () => { cancelled = true; };
  }, []);

  if (!data) return null;
  if (data.submission_count_previous === 0 || data.previous_month_avg == null) return null;

  const { previous_month_avg, delta } = data;
  const { icon, color } = arrow(delta);

  return (
    <div
      className="rounded-lg px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 text-sm"
      style={{
        background: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        color: "var(--color-text)",
      }}
    >
      <span>
        Bài này band{" "}
        <strong>{currentBand != null ? currentBand.toFixed(1) : "—"}</strong>
        {" · "}
        Tháng trước band <strong>{previous_month_avg.toFixed(1)}</strong>
      </span>
      <span style={{ color, fontWeight: 600 }}>
        {icon} {delta != null ? (delta >= 0 ? "+" : "") + delta.toFixed(1) : "—"} band
      </span>
    </div>
  );
}
