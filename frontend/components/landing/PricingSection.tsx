"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import WaitlistModal, { type TierKey } from "./WaitlistModal";

/**
 * PricingSection — Wave 6 Sprint 2D rebuild.
 *
 * Per .claude/skills/lingona-design:
 * - 02-layout/desktop-canvas.md: 2-col grid pricing tiers, max-w-[880px]
 * - 03-components/card-language.md: hero card pattern, border-2 border-teal
 *   for highlighted Pro tier with 'Lingona đề xuất' pill (factual, not
 *   'Most Popular' psychology)
 * - 03-components/primary-button.md: teal solid CTA Pro, secondary outline
 *   navy CTA Free
 * - 05-voice/microcopy-library.md: Vietnamese peer voice
 * - 09-anti-patterns/ai-generated-smell.md: NO rainbow gradient badge,
 *   NO 'Most Popular' English copy
 * - 09-anti-patterns/fake-stats-ban.md: honest pre-launch '09/07/2026 ra
 *   mắt' framing, no fabricated user counts
 *
 * Sprint 2D scope (Louis lock):
 * - 2-tier display only (Free + Pro 199k/tháng)
 * - 4 billing periods of Pro (1mo/3mo/6mo/12mo) deferred to post-launch
 *   when MoMo merchant account active. Sprint 2D = waitlist signup only,
 *   no purchase flow.
 * - Both CTAs trigger WaitlistModal with tier preselected.
 * - .edu auto-detect for student discount surfaces in modal email field
 *   hint + on backend signup.
 */

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
  "Sinh viên (.edu) tự động giảm 20%",
];

export default function PricingSection() {
  const [waitlistTier, setWaitlistTier] = useState<TierKey | null>(null);

  return (
    <section
      id="pricing"
      className="bg-cream py-20 lg:py-28 px-6 lg:px-12 xl:px-20 border-t border-gray-200"
    >
      <div className="max-w-[1120px] mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="font-display italic text-navy text-3xl lg:text-5xl leading-tight tracking-tight">
            Giá đơn giản — không bí mật
          </h2>
          <p className="mt-4 text-base lg:text-lg text-gray-700 max-w-2xl mx-auto">
            Free tier dùng được forever. Pro 199k/tháng — sinh viên giảm 20%.
          </p>
        </div>

        {/* Tier cards 2-col */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-[880px] mx-auto">
          {/* Free tier */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative bg-cream border border-gray-200 rounded-card p-8"
          >
            <h3 className="font-display italic text-navy text-2xl">Free</h3>
            <p className="mt-2 text-sm text-gray-600">
              Forever — không cần thẻ
            </p>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="font-display italic text-navy text-5xl">0₫</span>
              <span className="text-sm text-gray-500">/ tháng</span>
            </div>

            <ul className="mt-8 space-y-3">
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
              onClick={() => setWaitlistTier("free")}
              className="mt-10 w-full px-6 py-3 rounded-button border border-navy/20 text-navy font-semibold text-base hover:bg-navy/5 active:bg-navy/10 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Tham gia waitlist
            </button>
          </motion.div>

          {/* Pro tier — highlighted */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="relative bg-cream border-2 border-teal rounded-hero p-8 shadow-md"
          >
            {/* 'Lingona đề xuất' pill — factual recommendation, NOT 'Most Popular' psychology */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 bg-teal text-cream text-xs font-semibold rounded-full whitespace-nowrap">
                Lingona đề xuất
              </span>
            </div>

            <h3 className="font-display italic text-navy text-2xl">Pro</h3>
            <p className="mt-2 text-sm text-gray-600">
              Toàn quyền truy cập
            </p>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="font-display italic text-teal text-5xl">
                199k
              </span>
              <span className="text-sm text-gray-500">/ tháng</span>
            </div>
            <p className="mt-1 text-xs text-gray-600">
              Sinh viên (.edu):{" "}
              <span className="font-semibold text-teal">159k/tháng</span>
            </p>

            <ul className="mt-8 space-y-3">
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
              onClick={() => setWaitlistTier("pro")}
              className="mt-10 w-full px-6 py-3 rounded-button bg-teal text-cream font-semibold text-base hover:bg-teal-light active:bg-teal-dark transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Tham gia waitlist
            </button>
          </motion.div>
        </div>

        {/* Honest pre-launch note */}
        <p className="mt-10 text-center text-sm text-gray-600">
          Lingona ra mắt 09/07/2026. Hiện đang beta — đăng ký waitlist để giữ
          chỗ Pro.
        </p>
      </div>

      {/* Modal */}
      {waitlistTier && (
        <WaitlistModal
          initialTier={waitlistTier}
          onClose={() => setWaitlistTier(null)}
        />
      )}
    </section>
  );
}
