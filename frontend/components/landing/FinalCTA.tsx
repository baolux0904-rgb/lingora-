"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Mascot from "@/components/ui/Mascot";
import WaitlistModal, { type TierKey } from "./WaitlistModal";

/**
 * FinalCTA — Wave 6 Sprint 2E rebuild.
 *
 * Per .claude/skills/lingona-design:
 * - 02-layout/desktop-canvas.md: Pattern C asymmetric (text col-7 + Mascot col-5)
 * - 03-components/mascot.md: Lintopus 200px happy mood + enableIdle
 *   (closing earned moment)
 * - 03-components/primary-button.md: teal solid hero CTA + secondary text link
 * - 05-voice/persona.md + microcopy-library.md: peer voice 'Sẵn sàng bắt đầu?'
 *   + em-dash signature in body
 * - 06-motion/framer-variants.md: stagger reveal whileInView
 *
 * Closing landing moment — restate value + CTA to waitlist.
 */
export default function FinalCTA() {
  const [waitlistOpen, setWaitlistOpen] = useState<TierKey | null>(null);

  return (
    <section className="bg-cream py-20 lg:py-28 px-6 lg:px-12 xl:px-20 border-t border-gray-200">
      <div className="max-w-[1120px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Text — col-span-7 left */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            <h2 className="font-display italic text-navy text-3xl lg:text-5xl leading-tight">
              Sẵn sàng bắt đầu?
            </h2>

            <p className="mt-6 text-base lg:text-lg text-gray-700 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Đăng ký waitlist Pro — mình email bạn ngay khi Lingona mở đăng
              ký chính thức. Sinh viên (.edu) tự động giảm 20%.
            </p>

            <div className="mt-8 lg:mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                type="button"
                onClick={() => setWaitlistOpen("pro")}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-button bg-teal text-cream font-semibold text-lg hover:bg-teal-light active:bg-teal-dark transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                Tham gia waitlist Pro
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => setWaitlistOpen("free")}
                className="text-base text-navy hover:text-teal transition-colors duration-150 underline-offset-4 hover:underline"
              >
                Hoặc tham gia waitlist Free
              </button>
            </div>

            <p className="mt-6 text-sm text-gray-600">
              Lingona ra mắt 09/07/2026 — đăng ký sớm để giữ chỗ.
            </p>
          </motion.div>

          {/* Mascot — col-span-5 right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-5 flex justify-center lg:justify-end"
          >
            <Mascot size={200} mood="happy" enableIdle alt="Lintopus" />
          </motion.div>
        </div>
      </div>

      {/* Modal */}
      {waitlistOpen && (
        <WaitlistModal
          initialTier={waitlistOpen}
          onClose={() => setWaitlistOpen(null)}
        />
      )}
    </section>
  );
}
