"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import LandingPage from "@/components/landing/LandingPage";

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/home");
    }
  }, [isLoading, user, router]);

  // Already confirmed logged in — redirect is in flight, show nothing
  if (user) return null;

  // No user (either still loading or confirmed guest) — show landing immediately.
  // If auth resolves to a logged-in user, the useEffect above handles the redirect.
  return <LandingPage />;
}
