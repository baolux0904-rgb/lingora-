"use client";

import { useState, useEffect } from "react";
import { getScenarios } from "@/lib/api";
import type { Scenario } from "@/lib/types";

/**
 * Hook to fetch scenarios, optionally filtered by category.
 */
export function useScenarios(category?: string) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getScenarios(category)
      .then((data) => {
        if (!cancelled) {
          setScenarios(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Failed to load scenarios");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [category]);

  return { scenarios, loading, error };
}
