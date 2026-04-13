"use client";

/**
 * Google OAuth callback page.
 *
 * The backend redirects here with ?token=...&user=... after successful
 * Google authentication. This page reads the params, stores the auth
 * state in Zustand (same as loginUser), migrates guest progress, and
 * redirects to /home.
 */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { migrateGuestProgress } from "@/lib/api";
import { getGuestUserId, clearGuestUserId } from "@/lib/guestUser";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(errorParam === "google_failed" ? "Google sign-in failed. Please try again." : errorParam);
      return;
    }

    if (!token || !userParam) {
      setError("Missing authentication data. Please try signing in again.");
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam));
      useAuthStore.getState().setAuth(user, token);

      // Migrate guest progress if applicable
      const guestId = getGuestUserId();
      if (guestId) {
        migrateGuestProgress(guestId).catch(() => {});
        clearGuestUserId();
      }

      router.replace("/home");
    } catch {
      setError("Failed to process authentication. Please try again.");
    }
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
        <div className="text-center max-w-sm px-6">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-lg font-display font-bold mb-2" style={{ color: "var(--color-text)" }}>
            Sign-in failed
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>{error}</p>
          <a
            href="/login"
            className="inline-flex px-6 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: "#00A896", color: "#fff" }}
          >
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "#00A896", borderTopColor: "transparent" }} />
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Signing you in...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense>
      <GoogleCallbackContent />
    </Suspense>
  );
}
