"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Star, GraduationCap } from "lucide-react";
import WaitlistModal, { type TierKey } from "./WaitlistModal";

/**
 * PricingSection — Wave 6 Sprint 3.6 rebuild (production hotfix round 2).
 *
 * Per .claude/skills/lingona-design:
 * - 02-layout/desktop-canvas.md: 2-card grid (Free + Pro) inside max-w-1120px
 * - 03-components/card-language.md: cream-warm cards, border-2 border-teal
 *   for highlighted Pro tier with 'Lingona đề xuất' pill (factual, not
 *   'Most Popular' psychology)
 * - 03-components/primary-button.md: teal solid CTA Pro, secondary outline Free
 * - 04-modes/brand.md: cream brand canon
 * - 05-voice/microcopy-library.md + persona.md: Vietnamese peer voice
 * - 06-motion/framer-variants.md: scroll-into-view stagger
 * - 09-anti-patterns/ai-generated-smell.md: NO rainbow gradient,
 *   NO 'Most Popular' English copy
 * - 09-anti-patterns/jargon-ban.md: end-user voice — no dev terms in UI
 *
 * Sprint 3.6 scope (Louis production round-2 lock):
 * - DEFAULT display = base price 199k/m (no automatic discount). Louis:
 *   "nên để giá gốc là 199k và có một nút toggle nếu bạn là học sinh
 *    sinh viên thì giảm theo giá này".
 * - Student toggle "Tôi là học sinh / sinh viên" reveals per-tier student
 *   discount (1m -15% / 3m -17% / 6m -20% / 12m -25%). Frontend-only —
 *   real .edu verification gate ships when MoMo onboarding active
 *   (Sprint 7+). Note "Xác minh khi launch Pro thanh toán (T7/2026)".
 * - WaitlistModal body POST gains optional field studentInterested →
 *   student_status: 'interested' | null. Backend silently ignores extra
 *   fields today (manual destructure validator); forward-compat.
 * - Compare table: base prices prominent + separate student discount row
 *   instead of mixed display.
 *
 * 4-tier Pro pricing (1m / 3m / 6m / 12m) carries forward from Sprint
 * 3.5C-2. Backend ALLOWED_TIERS allowlist already accepts all 4 plus the
 * legacy values.
 */

type ProTierId = "pro_1m" | "pro_3m" | "pro_6m" | "pro_12m";

interface ProTier {
  id: ProTierId;
  months: number;
  label: string;       // e.g., '12 tháng'
  shortLabel: string;  // e.g., '12m' for toggle
  basePrice: number;             // pre-discount total (VND) — the default
  baseMonthlyEquiv: number;      // base price ÷ months (always 199_000)
  studentFinal: number;          // post-student-discount total
  studentMonthlyEquiv: number;   // student price ÷ months
  studentDiscountPct: number;    // 15 / 17 / 20 / 25
  featured?: boolean;            // 12m = true (best value star)
}

const PRO_TIERS: ProTier[] = [
  {
    id: "pro_1m",
    months: 1,
    label: "1 tháng",
    shortLabel: "1m",
    basePrice: 199_000,
    baseMonthlyEquiv: 199_000,
    studentFinal: 169_000,
    studentMonthlyEquiv: 169_000,
    studentDiscountPct: 15,
  },
  {
    id: "pro_3m",
    months: 3,
    label: "3 tháng",
    shortLabel: "3m",
    basePrice: 597_000,
    baseMonthlyEquiv: 199_000,
    studentFinal: 495_000,
    studentMonthlyEquiv: 165_000,
    studentDiscountPct: 17,
  },
  {
    id: "pro_6m",
    months: 6,
    label: "6 tháng",
    shortLabel: "6m",
    basePrice: 1_194_000,
    baseMonthlyEquiv: 199_000,
    studentFinal: 955_000,
    studentMonthlyEquiv: 159_000,
    studentDiscountPct: 20,
  },
  {
    id: "pro_12m",
    months: 12,
    label: "12 tháng",
    shortLabel: "12m",
    basePrice: 2_388_000,
    baseMonthlyEquiv: 199_000,
    studentFinal: 1_791_000,
    studentMonthlyEquiv: 149_000,
    studentDiscountPct: 25,
    featured: true,
  },
];

const DEFAULT_PRO_TIER: ProTierId = "pro_12m";

const FREE_FEATURES = [
  "1x Speaking AI mỗi ngày",
  "1x Writing AI mỗi ngày",
  "Reading + Listening Practice không giới hạn",
  "Battle Casual",
  "Streak + Daily missions",
  "Lưu tiến độ + lịch sử",
];

const PRO_FEATURES = [
  "Speaking AI 5x mỗi ngày (soft cap)",
  "Writing AI 5x mỗi ngày (soft cap)",
  "Battle Ranked + Leaderboard",
  "Analytics chi tiết + Roadmap",
  "Study Rooms + AI Group Coach",
  "Priority Support",
  "Tất cả tính năng Free",
];

/** Format VND with the vi-VN thousand separator (1.791.000 style). */
function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN");
}

export default function PricingSection() {
  const [waitlistTier, setWaitlistTier] = useState<TierKey | null>(null);
  const [waitlistStudent, setWaitlistStudent] = useState<boolean>(false);
  const [selectedTierId, setSelectedTierId] = useState<ProTierId>(DEFAULT_PRO_TIER);
  const [isStudent, setIsStudent] = useState<boolean>(false);

  const currentTier = PRO_TIERS.find((t) => t.id === selectedTierId) ?? PRO_TIERS[3];

  // Display values driven by isStudent toggle. Default = base (199k/m).
  const displayMonthly = isStudent
    ? currentTier.studentMonthlyEquiv
    : currentTier.baseMonthlyEquiv;
  const displayTotal = isStudent ? currentTier.studentFinal : currentTier.basePrice;

  function openWaitlist(tier: TierKey) {
    setWaitlistTier(tier);
    setWaitlistStudent(isStudent);
  }

  return (
    <section
      id="pricing"
      className="bg-cream py-20 lg:py-28 px-6 lg:px-12 xl:px-20 border-t border-gray-200"
    >
      <div className="max-w-[1120px] mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="font-display italic text-navy text-3xl lg:text-5xl leading-tight tracking-tight">
            Giá đơn giản — không bí mật
          </h2>
          <p className="mt-4 text-base lg:text-lg text-gray-700 max-w-2xl mx-auto">
            Free mãi mãi cho người mới bắt đầu. Pro khi bạn nghiêm túc với mục tiêu IELTS.
          </p>
        </div>

        {/* 2-card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-[880px] mx-auto">
          {/* Free card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative bg-cream-warm border border-gray-200 rounded-card p-8 flex flex-col"
          >
            <h3 className="font-display italic text-navy text-2xl">Free</h3>
            <p className="mt-2 text-sm text-gray-600">Mãi mãi miễn phí — không cần thẻ</p>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="font-display italic text-navy text-5xl">0₫</span>
              <span className="text-sm text-gray-500">/ tháng</span>
            </div>

            <ul className="mt-8 space-y-3 flex-1">
              {FREE_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm text-gray-700"
                >
                  <Check
                    className="w-5 h-5 text-teal flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => openWaitlist("free")}
              className="mt-10 w-full px-6 py-3 rounded-button border border-navy/20 text-navy font-semibold text-base hover:bg-navy/5 active:bg-navy/10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Tham gia waitlist Free
            </button>
          </motion.div>

          {/* Pro card — highlighted with billing toggle */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="relative bg-cream-warm border-2 border-teal rounded-hero p-8 shadow-md flex flex-col"
          >
            {/* 'Lingona đề xuất' pill */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 px-4 py-1 bg-teal text-cream text-xs font-semibold rounded-full whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                Lingona đề xuất
              </span>
            </div>

            <h3 className="font-display italic text-navy text-2xl">Pro</h3>
            <p className="mt-2 text-sm text-gray-600">
              AI không giới hạn + tất cả tính năng
            </p>

            {/* Billing toggle */}
            <div
              role="radiogroup"
              aria-label="Chọn chu kỳ Pro"
              className="mt-5 grid grid-cols-4 gap-1.5 p-1 bg-cream rounded-button border border-gray-200"
            >
              {PRO_TIERS.map((tier) => {
                const active = selectedTierId === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`relative px-2 py-1.5 rounded-button text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light ${
                      active
                        ? "bg-teal text-cream"
                        : "text-navy hover:bg-gray-50"
                    }`}
                  >
                    {tier.shortLabel}
                    {tier.featured && (
                      <Star
                        className="absolute -top-1.5 -right-1.5 w-3 h-3 text-amber-500 fill-amber-500"
                        aria-label="Tốt nhất"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected tier display — base by default, student-discounted when toggled */}
            <div className="mt-6" aria-live="polite">
              <div className="flex items-baseline gap-2">
                <span className="font-display italic text-teal text-5xl">
                  {formatVND(displayMonthly)}₫
                </span>
                <span className="text-sm text-gray-500">/ tháng</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <span>{formatVND(displayTotal)}₫ tổng cộng</span>
                {isStudent && (
                  <span className="px-2 py-0.5 rounded-button bg-teal/10 text-teal font-semibold text-xs">
                    -{currentTier.studentDiscountPct}%
                  </span>
                )}
              </div>
              {isStudent && (
                <div className="mt-1 text-xs text-gray-500 line-through">
                  {formatVND(currentTier.basePrice)}₫
                </div>
              )}
            </div>

            {/* Student toggle — Sprint 3.6 Louis lock */}
            <div className="mt-5 p-3 rounded-button bg-cream border border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isStudent}
                  onChange={(e) => setIsStudent(e.target.checked)}
                  className="w-4 h-4 accent-teal cursor-pointer"
                  aria-describedby="student-toggle-note"
                />
                <span className="flex items-center gap-1.5 text-sm font-medium text-navy">
                  <GraduationCap className="w-4 h-4 text-teal" aria-hidden="true" />
                  Tôi là học sinh / sinh viên
                </span>
              </label>
              <p
                id="student-toggle-note"
                className="mt-2 ml-7 text-xs text-gray-500"
              >
                Xác minh khi Lingona mở thanh toán Pro (07/2026).
              </p>
            </div>

            <ul className="mt-6 space-y-3 flex-1">
              {PRO_FEATURES.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm text-gray-700"
                >
                  <Check
                    className="w-5 h-5 text-teal flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => openWaitlist(currentTier.id)}
              className="mt-10 w-full px-6 py-3 rounded-button bg-teal text-cream font-semibold text-base hover:bg-teal-light active:bg-teal-dark transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Tham gia waitlist Pro {currentTier.label}
            </button>
          </motion.div>
        </div>

        {/* Compare-all table — base prices prominent + student discount row separate */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 lg:mt-16 max-w-[880px] mx-auto"
        >
          <h3 className="text-center text-sm font-semibold text-navy uppercase tracking-wide mb-6">
            So sánh các gói Pro
          </h3>
          <div className="rounded-card border border-gray-200 bg-cream-warm overflow-hidden">
            {/* Base price row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-200">
              {PRO_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`p-4 lg:p-6 text-center ${
                    tier.featured ? "bg-teal/5" : ""
                  }`}
                >
                  <p className="text-xs font-semibold text-navy uppercase tracking-wide mb-3">
                    {tier.label}
                    {tier.featured && (
                      <Star
                        className="inline-block w-3 h-3 text-amber-500 fill-amber-500 ml-1 -mt-0.5"
                        aria-label="Tốt nhất"
                      />
                    )}
                  </p>
                  <p className="font-display italic text-teal text-2xl lg:text-3xl">
                    {formatVND(tier.basePrice)}₫
                  </p>
                  <p className="mt-2 text-xs text-gray-600">
                    {formatVND(tier.baseMonthlyEquiv)}₫ / tháng
                  </p>
                </div>
              ))}
            </div>

            {/* Student discount row */}
            <div className="border-t border-gray-200 bg-cream/60 px-4 lg:px-6 py-3 text-center">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal uppercase tracking-wide">
                <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
                Học sinh / sinh viên — giảm thêm
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-200 bg-cream/40">
              {PRO_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`p-4 text-center ${
                    tier.featured ? "bg-teal/5" : ""
                  }`}
                >
                  <p className="text-sm font-semibold text-navy">
                    -{tier.studentDiscountPct}%
                  </p>
                  <p className="mt-1 font-display italic text-teal text-xl">
                    {formatVND(tier.studentFinal)}₫
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    {formatVND(tier.studentMonthlyEquiv)}₫ / tháng
                  </p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-gray-500">
            Tất cả gói: 7 ngày hoàn tiền nếu không vừa ý. Học sinh / sinh viên xác minh khi mở thanh toán (07/2026).
          </p>
        </motion.div>

        {/* Honest pre-launch note */}
        <p className="mt-10 text-center text-sm text-gray-600">
          Lingona ra mắt 09/07/2026. Hiện đang beta — đăng ký waitlist để giữ chỗ Pro.
        </p>
      </div>

      {/* Modal */}
      {waitlistTier && (
        <WaitlistModal
          initialTier={waitlistTier}
          studentInterested={waitlistStudent}
          onClose={() => setWaitlistTier(null)}
        />
      )}
    </section>
  );
}
