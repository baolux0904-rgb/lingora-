"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import Mascot from "@/components/ui/Mascot";

/**
 * WaitlistModal — Wave 6 Sprint 2D commit 3 (full implementation).
 *
 * Per .claude/skills/lingona-design:
 * - 03-components/modal-frozen.md: canonical modal pattern (bg-navy/60
 *   backdrop, bg-cream content, rounded-card, max-w-md, fade + slide-up)
 * - 03-components/primary-button.md: teal solid submit, loading state
 *   with spinner + 'Đang gửi...' label
 * - 03-components/card-language.md: form input styling (rounded-button
 *   border-gray-300 focus:border-teal focus:ring-1)
 * - 05-voice/persona.md + microcopy-library.md: peer voice Vietnamese
 *   form labels ('Mình gọi bạn là gì?' / 'Bạn quan tâm gói nào?')
 * - 06-motion/framer-variants.md: AnimatePresence backdrop fade + modal
 *   slide-up, exit animations on close
 *
 * Fields (Louis Sprint 2D lock):
 * - name (required, 2-80 chars)
 * - email (required, .edu hint shown inline)
 * - interested_tier (Free / Pro 199k / Pro Annual sắp ra mắt)
 * - goal_band (5.5 / 6.0 / 6.5 / 7.0 / 7.5+ / Chưa biết — defaults 'unsure')
 *
 * States:
 * - idle: form ready
 * - submitting: spinner + 'Đang gửi...' button label, fields disabled
 * - success: Lintopus happy mood + Vietnamese confirmation message + close CTA
 * - error: inline error message bg-red-50 border-red-200
 *
 * Backend integration:
 * - POST {NEXT_PUBLIC_API_URL || '/api/v1'}/public/waitlist
 * - Validation matches backend (email/name/tier/goal_band)
 * - 201 success → shows backend message (.edu users get '20% off' note)
 * - 409 dup / 400 validation / 500 server / network failure handled
 *
 * Accessibility:
 * - role='dialog' aria-modal='true' aria-labelledby
 * - Escape key closes
 * - Click backdrop closes
 * - First input auto-focused on mount
 * - body scroll locked while open
 */

/**
 * Waitlist tier identifiers — Wave 6 Sprint 3.5C-2 expansion.
 *
 * Old union ("free" | "pro" | "pro_annual") was a 3-option Sprint 2D
 * lock. New 5-option set mirrors the rebuilt PricingSection 4-tier Pro
 * pricing (1m / 3m / 6m / 12m).
 *
 * Backend ALLOWED_TIERS allowlist in publicController.js was extended
 * in this same commit to keep the legacy values ('pro', 'pro_annual')
 * AND accept the four new pro_*m values, so existing waitlist rows
 * stay valid.
 */
export type TierKey = "free" | "pro_1m" | "pro_3m" | "pro_6m" | "pro_12m";

interface WaitlistModalProps {
  initialTier: TierKey;
  onClose: () => void;
}

interface TierOption {
  value: TierKey;
  label: string;
}

const TIER_OPTIONS: TierOption[] = [
  { value: "free",    label: "Free (0₫ — mãi mãi)" },
  { value: "pro_1m",  label: "Pro 1 tháng (169k)" },
  { value: "pro_3m",  label: "Pro 3 tháng (495k)" },
  { value: "pro_6m",  label: "Pro 6 tháng (955k)" },
  { value: "pro_12m", label: "Pro 12 tháng (1.791k) ★ Tốt nhất" },
];

const GOAL_BAND_OPTIONS: { value: string; label: string }[] = [
  { value: "unsure", label: "Chưa biết" },
  { value: "5.5", label: "Band 5.5" },
  { value: "6.0", label: "Band 6.0" },
  { value: "6.5", label: "Band 6.5" },
  { value: "7.0", label: "Band 7.0" },
  { value: "7.5+", label: "Band 7.5+" },
];

type FormState = "idle" | "submitting" | "success" | "error";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export default function WaitlistModal({
  initialTier,
  onClose,
}: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [tier, setTier] = useState<TierKey>(initialTier);
  const [goalBand, setGoalBand] = useState<string>("unsure");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // Focus first input on mount + lock body scroll
  useEffect(() => {
    firstInputRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Escape key closes modal
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "submitting") return;

    setState("submitting");
    setErrorMsg("");

    try {
      const response = await fetch(`${API_BASE_URL}/public/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          interested_tier: tier,
          goal_band: goalBand,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setState("error");
        setErrorMsg(
          (data && typeof data.message === "string" && data.message) ||
            "Có lỗi rồi — thử lại"
        );
        return;
      }

      setState("success");
      setSuccessMsg(
        (data && typeof data.message === "string" && data.message) ||
          "Đã ghi nhận! Mình sẽ email bạn ngay khi mở đăng ký Pro 🐙"
      );
    } catch {
      setState("error");
      setErrorMsg("Không kết nối được. Kiểm tra mạng.");
    }
  }

  const isSubmitting = state === "submitting";
  const isSuccess = state === "success";

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed inset-0 z-40 bg-navy/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="pointer-events-auto bg-cream border border-gray-200 rounded-card p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-labelledby="waitlist-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <header className="flex items-start justify-between mb-2">
            <h2
              id="waitlist-title"
              className="font-display italic text-navy text-2xl"
            >
              {isSuccess ? "Cảm ơn bạn 🐙" : "Tham gia waitlist"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 -mr-1 -mt-1 rounded-button text-gray-500 hover:bg-gray-100 transition-colors duration-150"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </header>

          {!isSuccess && (
            <p className="text-sm text-gray-600 mb-6">
              Mình sẽ email bạn ngay khi Lingona mở đăng ký Pro
              (09/07/2026).
            </p>
          )}

          {/* Success state */}
          {isSuccess && (
            <div className="flex flex-col items-center text-center py-4">
              <Mascot size={120} mood="happy" />
              <p className="mt-6 text-base text-navy leading-relaxed">
                {successMsg}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-8 px-6 py-3 rounded-button bg-teal text-cream font-semibold hover:bg-teal-light transition-colors duration-150"
              >
                Tuyệt — đóng nhé
              </button>
            </div>
          )}

          {/* Form */}
          {!isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <label className="block">
                <span className="text-sm font-medium text-navy">
                  Tên của bạn
                </span>
                <input
                  ref={firstInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="Mình gọi bạn là gì?"
                  disabled={isSubmitting}
                  className="mt-1 block w-full px-4 py-2.5 rounded-button bg-cream border border-gray-300 focus:border-teal focus:ring-1 focus:ring-teal focus:outline-none text-base text-navy placeholder:text-gray-400 disabled:opacity-50 transition-colors duration-150"
                />
              </label>

              {/* Email */}
              <label className="block">
                <span className="text-sm font-medium text-navy">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  className="mt-1 block w-full px-4 py-2.5 rounded-button bg-cream border border-gray-300 focus:border-teal focus:ring-1 focus:ring-teal focus:outline-none text-base text-navy placeholder:text-gray-400 disabled:opacity-50 transition-colors duration-150"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Email .edu: tự động giảm 20% gói Pro khi launch.
                </p>
              </label>

              {/* Tier */}
              <label className="block">
                <span className="text-sm font-medium text-navy">
                  Bạn quan tâm gói nào?
                </span>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as TierKey)}
                  disabled={isSubmitting}
                  className="mt-1 block w-full px-4 py-2.5 rounded-button bg-cream border border-gray-300 focus:border-teal focus:ring-1 focus:ring-teal focus:outline-none text-base text-navy disabled:opacity-50 transition-colors duration-150"
                >
                  {TIER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Goal band */}
              <label className="block">
                <span className="text-sm font-medium text-navy">
                  Mục tiêu band của bạn
                </span>
                <select
                  value={goalBand}
                  onChange={(e) => setGoalBand(e.target.value)}
                  disabled={isSubmitting}
                  className="mt-1 block w-full px-4 py-2.5 rounded-button bg-cream border border-gray-300 focus:border-teal focus:ring-1 focus:ring-teal focus:outline-none text-base text-navy disabled:opacity-50 transition-colors duration-150"
                >
                  {GOAL_BAND_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Error message */}
              {state === "error" && errorMsg && (
                <div
                  role="alert"
                  className="p-3 rounded-button bg-red-50 border border-red-200 text-sm text-red-700"
                >
                  {errorMsg}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !email || !name}
                className="w-full px-6 py-3 rounded-button bg-teal text-cream font-semibold text-base hover:bg-teal-light active:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="w-4 h-4 animate-spin"
                      aria-hidden="true"
                    />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi đăng ký"
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Bằng việc đăng ký, bạn đồng ý nhận email từ Lingona.
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export { WaitlistModal };
