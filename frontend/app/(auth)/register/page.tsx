"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Check, X } from "lucide-react";
import Mascot from "@/components/ui/Mascot";
import {
  registerUser,
  migrateGuestProgress,
  checkUsernameAvailability,
} from "@/lib/api";
import { useAuthStore } from "@/lib/stores/authStore";
import { getGuestUserId, clearGuestUserId } from "@/lib/guestUser";
import { analytics } from "@/lib/analytics";

/**
 * Register page — Wave 6 Sprint 3C rebuild.
 *
 * Per .claude/skills/lingona-design/:
 * - 02-layout/desktop-canvas.md: Pattern C asymmetric (form 7-col + Lintopus 5-col)
 * - 03-components/mascot.md: Lintopus 200px happy + bubble welcome
 * - 03-components/primary-button.md: teal CTA + secondary border Google
 * - 04-modes/brand.md: cream brand
 * - 05-voice/persona.md + microcopy-library.md: peer voice Vietnamese
 * - 09-anti-patterns/ai-generated-smell.md + corporate-translate.md
 *
 * Form fields: email + name + username (with availability check) + password
 * Auth flow: email/password TOP → 'Hoặc dùng Google' divider → Google OAuth BOTTOM
 *
 * Username availability check (Sprint 3B endpoint):
 * - 500ms debounce after typing stops
 * - GET /public/username-availability?username=<name> via lib/api helper
 * - Race protection via lastCheckedRef
 * - Visual: icon (Check teal / X red / Loader2 spin) + inline text status
 *
 * Default role 'kid' (Sprint 3 doesn't surface a role picker — reserved for
 * Sprint 3D onboarding flow).
 */

const VALID_USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;

type AvailState = "idle" | "checking" | "available" | "taken" | "invalid";

export default function RegisterPage() {
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const authReady = !useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const [availState, setAvailState] = useState<AvailState>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCheckedRef = useRef<string>("");

  useEffect(() => {
    if (authReady && user) router.replace("/");
  }, [authReady, user, router]);

  // Debounced username availability check
  useEffect(() => {
    const cleaned = username.trim().toLowerCase();

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!cleaned) {
      setAvailState("idle");
      return;
    }

    if (!VALID_USERNAME_RE.test(cleaned)) {
      setAvailState("invalid");
      return;
    }

    setAvailState("checking");

    debounceRef.current = setTimeout(async () => {
      lastCheckedRef.current = cleaned;
      try {
        const data = await checkUsernameAvailability(cleaned);
        // Race protection: a faster value swap mid-flight wins.
        if (lastCheckedRef.current !== cleaned) return;
        if (data.available) setAvailState("available");
        else if (data.reason === "invalid") setAvailState("invalid");
        else setAvailState("taken");
      } catch {
        // Network fail — fall back to idle so the submit isn't permanently
        // blocked; backend re-validates on submit anyway.
        if (lastCheckedRef.current === cleaned) setAvailState("idle");
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanUsername = username.trim();

    if (!cleanEmail || !cleanName || !cleanUsername || !password) {
      setError("Điền đủ các ô nhé.");
      return;
    }
    if (!VALID_USERNAME_RE.test(cleanUsername)) {
      setError("Username chỉ dùng chữ cái, số, dấu gạch dưới (3-30 ký tự).");
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu cần ít nhất 8 ký tự.");
      return;
    }
    if (availState === "taken") {
      setError("Username này có người dùng rồi 🐙");
      return;
    }

    setSubmitting(true);
    try {
      await registerUser({
        email: cleanEmail,
        name: cleanName,
        username: cleanUsername,
        password,
        role: "kid",
      });

      const guestId = getGuestUserId();
      if (guestId) {
        await migrateGuestProgress(guestId).catch(() => {});
        clearGuestUserId();
      }

      analytics.signupComplete("email");
      router.replace("/?new=1");
    } catch (err) {
      setError(
        (err as Error)?.message || "Đăng ký không thành công — thử lại nhé.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoogleOAuth() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";
    window.location.href = `${apiUrl}/auth/google`;
  }

  const submitDisabled =
    submitting ||
    !email.trim() ||
    !name.trim() ||
    !username.trim() ||
    !password ||
    availState === "taken" ||
    availState === "invalid" ||
    availState === "checking";

  return (
    <main className="min-h-screen px-6 lg:px-12 xl:px-20 py-12 lg:py-20">
      <div className="max-w-[1120px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Form 7-col left */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="lg:col-span-7 lg:col-start-1"
          >
            <h1 className="font-display italic text-navy text-3xl lg:text-4xl leading-tight">
              Đăng ký
            </h1>
            <p className="mt-3 text-base text-gray-600">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="text-teal hover:text-teal-dark underline-offset-4 hover:underline transition-colors duration-fast"
              >
                Đăng nhập
              </Link>
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-5 max-w-md">
              {/* Email */}
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
                <p className="mt-1.5 text-xs text-gray-500">
                  Email .edu: tự động giảm 20% gói Pro khi launch.
                </p>
              </label>

              {/* Name */}
              <label className="block">
                <span className="text-sm font-medium text-navy">Tên của bạn</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  placeholder="Mình gọi bạn là gì?"
                  disabled={submitting}
                  className="mt-1.5 block w-full px-4 py-2.5 rounded-button bg-cream border border-gray-300 focus:border-teal focus:ring-1 focus:ring-teal focus:outline-none text-base text-navy placeholder:text-gray-400 disabled:opacity-50 transition-colors duration-fast"
                />
              </label>

              {/* Username + availability */}
              <label className="block">
                <span className="text-sm font-medium text-navy">Username</span>
                <div className="relative mt-1.5">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                    placeholder="vd: louis_2026"
                    disabled={submitting}
                    aria-invalid={availState === "taken" || availState === "invalid"}
                    aria-describedby="username-status"
                    className="block w-full px-4 py-2.5 pr-10 rounded-button bg-cream border border-gray-300 focus:border-teal focus:ring-1 focus:ring-teal focus:outline-none text-base text-navy placeholder:text-gray-400 disabled:opacity-50 transition-colors duration-fast"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    {availState === "checking" && (
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" aria-hidden="true" />
                    )}
                    {availState === "available" && (
                      <Check className="w-5 h-5 text-teal" aria-hidden="true" />
                    )}
                    {(availState === "taken" || availState === "invalid") && (
                      <X className="w-5 h-5 text-red-500" aria-hidden="true" />
                    )}
                  </div>
                </div>
                <p
                  id="username-status"
                  role="status"
                  aria-live="polite"
                  className={`mt-1.5 text-xs ${
                    availState === "available"
                      ? "text-teal"
                      : availState === "taken" || availState === "invalid"
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {availState === "idle" &&
                    "3-30 ký tự — chữ cái, số, dấu gạch dưới"}
                  {availState === "checking" && "Đang kiểm tra..."}
                  {availState === "available" && "Username dùng được 🐙"}
                  {availState === "taken" && "Username này có người dùng rồi"}
                  {availState === "invalid" &&
                    "3-30 ký tự — chữ cái, số, dấu gạch dưới"}
                </p>
              </label>

              {/* Password */}
              <label className="block">
                <span className="text-sm font-medium text-navy">Mật khẩu</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Ít nhất 8 ký tự"
                  disabled={submitting}
                  className="mt-1.5 block w-full px-4 py-2.5 rounded-button bg-cream border border-gray-300 focus:border-teal focus:ring-1 focus:ring-teal focus:outline-none text-base text-navy placeholder:text-gray-400 disabled:opacity-50 transition-colors duration-fast"
                />
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
                disabled={submitDisabled}
                className="w-full px-6 py-3 rounded-button bg-teal text-cream font-semibold text-base hover:bg-teal-light active:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Đang đăng ký...
                  </>
                ) : (
                  <>
                    Đăng ký
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

              <p className="text-xs text-gray-500 text-center">
                Bằng việc đăng ký, bạn đồng ý với{" "}
                <Link href="/terms" className="underline hover:text-teal">
                  Điều khoản
                </Link>{" "}
                và{" "}
                <Link href="/privacy" className="underline hover:text-teal">
                  Bảo mật
                </Link>
                .
              </p>
            </form>
          </motion.div>

          {/* Lintopus 5-col right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-5 flex justify-center lg:justify-end order-first lg:order-last lg:sticky lg:top-20"
          >
            <Mascot
              size={200}
              mood="happy"
              bubble="Hi — mình là Lintopus 🐙"
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

/** Inline Google G icon — same as Login */
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
