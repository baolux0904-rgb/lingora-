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

  if (isLoading) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{ backgroundColor: "#0A0F1E" }}
      >
        <div className="w-8 h-8 border-2 border-[#00A896] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return <LandingPage />;
}
