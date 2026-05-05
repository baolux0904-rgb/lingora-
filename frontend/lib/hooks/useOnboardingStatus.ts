"use client";

import { useEffect, useState, useCallback } from "react";
import { getOnboardingStatus } from "@/lib/api";
import type { OnboardingStatus } from "@/lib/types";

/**
 * useOnboardingStatus — single fetch + module-level cache for
 * onboarding state. Used by the Sprint 4E.2 /home banner and the
 * 3 soft-gate modals (Writing AI / Speaking scenarios / Battle).
 *
 * Cached so opening the Writing tab + Battle queue + a scenario in
 * one session doesn't trigger 3 separate /status fetches. Components
 * that mutate onboarding (the OnboardingFlow modal completing or the
 * banner triggering re-open) call `invalidateOnboardingStatus()` to
 * force a refetch on next mount.
 */

let cachedStatus: OnboardingStatus | null = null;
let inflight: Promise<OnboardingStatus> | null = null;
const subscribers = new Set<() => void>();

export function invalidateOnboardingStatus(): void {
  cachedStatus = null;
  inflight = null;
  subscribers.forEach((fn) => fn());
}

export interface UseOnboardingStatus {
  status: OnboardingStatus | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useOnboardingStatus(): UseOnboardingStatus {
  const [status, setStatus] = useState<OnboardingStatus | null>(cachedStatus);
  const [loading, setLoading] = useState<boolean>(cachedStatus === null);

  const fetchStatus = useCallback(async () => {
    if (cachedStatus !== null && inflight === null) {
      setStatus(cachedStatus);
      setLoading(false);
      return;
    }
    if (!inflight) {
      inflight = getOnboardingStatus()
        .then((s) => {
          cachedStatus = s;
          inflight = null;
          subscribers.forEach((fn) => fn());
          return s;
        })
        .catch((err) => {
          inflight = null;
          throw err;
        });
    }
    try {
      const s = await inflight;
      setStatus(s);
    } catch {
      /* leave status as null; gates fail-open (assume completed) */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatus();
    const onChange = () => {
      setStatus(cachedStatus);
      setLoading(cachedStatus === null);
    };
    subscribers.add(onChange);
    return () => {
      subscribers.delete(onChange);
    };
  }, [fetchStatus]);

  const refetch = useCallback(async () => {
    invalidateOnboardingStatus();
    setLoading(true);
    await fetchStatus();
  }, [fetchStatus]);

  return { status, loading, refetch };
}
