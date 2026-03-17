"use client";

/**
 * useSpeakingMetrics
 *
 * Fetches pronunciation score trend for the current user over the last 30 days.
 * Returns daily aggregates and summary stats for the SpeakingMetrics component.
 */

import { useState, useEffect } from "react";
import { getSpeakingMetrics } from "@/lib/api";
import type { SpeakingMetricsData } from "@/lib/types";

export function useSpeakingMetrics(userId: string | null) {
  const [data, setData]       = useState<SpeakingMetricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getSpeakingMetrics(userId)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((err: Error) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [userId]);

  return { data, loading, error };
}
