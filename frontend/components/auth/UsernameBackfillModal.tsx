"use client";

/**
 * components/auth/UsernameBackfillModal.tsx — Wave 6 Sprint 3D.
 *
 * Full-screen blocking modal for authenticated users whose username is null
 * (the legacy beta cohort that predates Wave 2 username collection). User
 * MUST pick a value before any authenticated route renders — there is no
 * close button, no Escape dismiss, no backdrop click dismiss.
 *
 * Per .claude/skills/lingona-design/:
 * - 03-components/modal-frozen.md: canonical modal pattern (cream surface,
 *   navy/70 backdrop, rounded-card)
 * - 03-components/mascot.md: Lintopus 120px happy
 * - 03-components/primary-button.md: teal solid CTA + secondary border button
 * - 04-modes/brand.md: cream surface inside navy backdrop
 * - 05-voice/persona.md + microcopy-library.md: peer voice
 *
 * Hybrid pick UX (Louis decision): manual input with debounced availability
 * check (mirrors Register page) + "Để Lintopus chọn cho mình 🐙" secondary
 * button that calls the autogen endpoint and fills the input. The user can
 * still edit the autogen result before submit.
 */

import { useState, useEffect, useRef, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Check, X, Loader2, Sparkles } from "lucide-react";
import Mascot from "@/components/ui/Mascot";
import {
  checkUsernameAvailability,
  updateMyUsername,
  autogenMyUsername,
} from "@/lib/api";
import {
  usernameBackfillSchema,
  USERNAME_REGEX,
  getFirstError,
} from "@/lib/schemas/auth";

// Sprint 3E — VALID_USERNAME_RE moved to lib/schemas/auth as USERNAME_REGEX.

type AvailState = "idle" | "checking" | "available" | "taken" | "invalid";

export default function UsernameBackfillModal() {
  const [username, setUsername] = useState("");
  const [availState, setAvailState] = useState<AvailState>("idle");
  const [submitting, setSubmitting] = useState(false);
  const [autogenLoading, setAutogenLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCheckedRef = useRef("");

  // Lock body scroll while the modal is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Debounced availability check (same pattern as Register page).
  useEffect(() => {
    const cleaned = username.trim().toLowerCase();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!cleaned) {
      setAvailState("idle");
      return;
    }
    if (!USERNAME_REGEX.test(cleaned)) {
      setAvailState("invalid");
      return;
    }

    setAvailState("checking");
    debounceRef.current = setTimeout(async () => {
      lastCheckedRef.current = cleaned;
      try {
        const data = await checkUsernameAvailability(cleaned);
        if (lastCheckedRef.current !== cleaned) return;
        if (data.available) setAvailState("available");
        else if (data.reason === "invalid") setAvailState("invalid");
        else setAvailState("taken");
      } catch {
        if (lastCheckedRef.current === cleaned) setAvailState("idle");
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username]);

  async function handleAutogen() {
    if (autogenLoading || submitting) return;
    setAutogenLoading(true);
    setError("");
    try {
      const { candidate } = await autogenMyUsername();
      setUsername(candidate);
    } catch (err) {
      setError((err as Error)?.message || "Tạo username không thành công — thử lại");
    } finally {
      setAutogenLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    // Sprint 3E — replaced manual regex check with shared usernameBackfillSchema.
    const parsed = usernameBackfillSchema.safeParse({ username });
    if (!parsed.success) {
      setError(getFirstError(parsed) ?? "Username không hợp lệ");
      return;
    }
    if (availState === "taken") {
      setError("Username này có người dùng rồi 🐙");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await updateMyUsername(parsed.data.username);
      // patchUser inside updateMyUsername populates user.username — the
      // (app) layout re-renders and unmounts this modal automatically.
    } catch (err) {
      setError((err as Error)?.message || "Lưu không thành công — thử lại");
      setSubmitting(false);
    }
  }

  const submitDisabled =
    submitting ||
    autogenLoading ||
    !username.trim() ||
    availState === "taken" ||
    availState === "invalid" ||
    availState === "checking";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backfill-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-cream border border-gray-200 rounded-card p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-lg"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <Mascot size={120} mood="happy" />
          <h2
            id="backfill-title"
            className="mt-4 font-display italic text-navy text-2xl"
          >
            Bạn chọn username
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Username dùng cho profile + Battle leaderboard. Có thể đổi sau
            (30 ngày 1 lần).
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                disabled={submitting || autogenLoading}
                autoFocus
                aria-invalid={availState === "taken" || availState === "invalid"}
                aria-describedby="backfill-status"
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
              id="backfill-status"
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
              {availState === "idle" && "3-30 ký tự — chữ cái, số, dấu gạch dưới"}
              {availState === "checking" && "Đang kiểm tra..."}
              {availState === "available" && "Username dùng được 🐙"}
              {availState === "taken" && "Username này có người dùng rồi"}
              {availState === "invalid" && "3-30 ký tự — chữ cái, số, dấu gạch dưới"}
            </p>
          </label>

          <button
            type="button"
            onClick={handleAutogen}
            disabled={submitting || autogenLoading}
            className="w-full px-6 py-2.5 rounded-button bg-cream border border-gray-300 text-navy font-medium text-sm hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-fast flex items-center justify-center gap-2"
          >
            {autogenLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Đang tạo...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-teal" aria-hidden="true" />
                Để Lintopus chọn cho mình 🐙
              </>
            )}
          </button>

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
            className="w-full px-6 py-3 rounded-button bg-teal text-cream font-semibold text-base hover:bg-teal-light active:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-fast flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Đang lưu...
              </>
            ) : (
              "Lưu username"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
