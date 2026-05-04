"use client";

import { Suspense, useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import Mascot from "@/components/ui/Mascot";
import { loginUser, migrateGuestProgress } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/authStore";
import { getGuestUserId, clearGuestUserId } from "@/lib/guestUser";
import { loginSchema, getFirstError } from "@/lib/schemas/auth";

/**
 * Login page — Wave 6 Sprint 3C rebuild.
 *
 * Per .claude/skills/lingona-design/:
 * - 02-layout/desktop-canvas.md: Pattern C asymmetric (form 7-col + Lintopus 5-col)
 * - 03-components/mascot.md: Lintopus 200px (auth size, focused on form)
 * - 03-components/primary-button.md: teal solid CTA + secondary border Google
 * - 04-modes/brand.md: cream bg + navy text + DM Sans body + Playfair Italic headline
 * - 05-voice/persona.md + microcopy-library.md: peer voice Vietnamese
 * - 09-anti-patterns/ai-generated-smell.md: NO gradient text, NO glow, NO dark theme
 * - 09-anti-patterns/corporate-translate.md: NO 'vui lòng', NO 'quý khách'
 *
 * Form fields: email + password
 * Auth flow: email/password TOP → 'Hoặc dùng Google' divider → Google OAuth BOTTOM
 *
 * Re-uses existing lib/api.ts loginUser (which sets the auth store on success
 * via useAuthStore.setAuth) + migrateGuestProgress + guestUser helpers so the
 * post-login flow stays identical to legacy behaviour.
 */
export default function LoginPage() {
  // useSearchParams forces client-side rendering for whatever uses it; wrap
  // in Suspense so static prerender doesn't bail per Next.js 14 rules.
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Sprint 3.5B — default destination is /home (was '/'). The Notion-style
  // landing now renders for logged-in users too, so '/' would dump them back
  // on marketing instead of the dashboard they expected after login.
  const redirectTo = searchParams.get("redirect") || "/home";

  const user = useAuthStore((s) => s.user);
  const authReady = !useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authReady && user) router.replace(redirectTo);
  }, [authReady, user, router, redirectTo]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    // Sprint 3E — replaced manual presence check with shared zod schema.
    // Schema transforms (.trim(), .toLowerCase()) apply to email automatically.
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(getFirstError(parsed) ?? "Email và mật khẩu cần điền cả hai.");
      return;
    }

    setSubmitting(true);
    try {
      await loginUser({ email: parsed.data.email, password: parsed.data.password });

      const guestId = getGuestUserId();
      if (guestId) {
        await migrateGuestProgress(guestId).catch(() => {});
        clearGuestUserId();
      }

      router.replace(redirectTo);
    } catch (err) {
      setError(
        (err as Error)?.message || "Đăng nhập không thành công — thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoogleOAuth() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";
    window.location.href = `${apiUrl}/auth/google`;
  }

  const disabled = submitting || !email.trim() || !password;

  return (
    <main className="min-h-screen px-6 lg:px-12 xl:px-20 py-12 lg:py-20">
      <div className="max-w-[1120px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Form 7-col left */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="lg:col-span-7 lg:col-start-1"
          >
            <h1 className="font-display italic text-navy text-3xl lg:text-4xl leading-tight">
              Đăng nhập
            </h1>
            <p className="mt-3 text-base text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="text-teal hover:text-teal-dark underline-offset-4 hover:underline transition-colors duration-fast"
              >
                Đăng ký
              </Link>
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-5 max-w-md">
              <label className="block">
                <span className="text-sm font-medium text-navy">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={submitting}
                  className="mt-1.5 block w-full px-4 py-2.5 rounded-button bg-cream border border-gray-300 focus:border-teal focus:ring-1 focus:ring-teal focus:outline-none text-base text-navy placeholder:text-gray-400 disabled:opacity-50 transition-colors duration-fast"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-navy">Mật khẩu</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={submitting}
                  className="mt-1.5 block w-full px-4 py-2.5 rounded-button bg-cream border border-gray-300 focus:border-teal focus:ring-1 focus:ring-teal focus:outline-none text-base text-navy placeholder:text-gray-400 disabled:opacity-50 transition-colors duration-fast"
                />
                <Link
                  href="/forgot-password"
                  className="mt-1.5 inline-block text-xs text-gray-600 hover:text-teal transition-colors duration-fast"
                >
                  Quên mật khẩu?
                </Link>
              </label>

              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-button bg-red-50 border border-red-200 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={disabled}
                className="w-full px-6 py-3 rounded-button bg-teal text-cream font-semibold text-base hover:bg-teal-light active:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-cream text-xs text-gray-500">Hoặc dùng Google</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleOAuth}
                disabled={submitting}
                className="w-full px-6 py-3 rounded-button bg-cream border border-gray-300 text-navy font-semibold text-base hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream flex items-center justify-center gap-3"
              >
                <GoogleIcon className="w-5 h-5" />
                Tiếp tục với Google
              </button>
            </form>
          </motion.div>

          {/* Lintopus 5-col right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-5 flex justify-center lg:justify-end order-first lg:order-last"
          >
            <Mascot
              size={200}
              mood="happy"
              bubble="Chào — login để tiếp tục nhé"
              bubblePosition="below"
              enableIdle
              priority
            />
          </motion.div>
        </div>
      </div>
    </main>
  );
}

/** Inline Google G icon — keeps bundle lean (no extra lib for 1 icon) */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
