"use client";

import { useRouter } from "next/navigation";
import Mascot from "@/components/ui/Mascot";
import { useAuthStore } from "@/lib/stores/authStore";

export default function NotFound() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  const handleClick = () => {
    if (isLoading) return;
    router.push(user ? "/home" : "/");
  };

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center gap-5 px-6 text-center"
      style={{ background: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <Mascot size={120} />

      <h1 className="text-xl font-display font-bold">
        Trang này không tồn tại!
      </h1>

      <p className="text-sm max-w-xs" style={{ color: "var(--color-text-secondary)" }}>
        Để mình đưa bạn về trang chính 🐙
      </p>

      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        aria-busy={isLoading}
        className="px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-wait focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2"
        style={{ background: "linear-gradient(135deg, #00A896, #00C4B0)" }}
      >
        Về trang chính
      </button>
    </div>
  );
}
