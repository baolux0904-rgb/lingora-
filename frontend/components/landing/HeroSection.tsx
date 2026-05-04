"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Mascot from "@/components/ui/Mascot";

/**
 * Hero section — Wave 6 Sprint 2B rebuild.
 *
 * Per .claude/skills/lingona-design:
 * - 02-layout/desktop-canvas.md: Pattern C asymmetric (text col-7 + visual col-5)
 * - 03-components/mascot.md: Lintopus 320px happy mood, hero placement
 * - 03-components/primary-button.md: solid teal CTA (NO gradient, NO glow)
 * - 04-modes/brand.md: brand mode default (cream surface, navy text)
 * - 05-voice/persona.md: peer voice 'mình/bạn' Vietnamese-first
 * - 09-anti-patterns/ai-generated-smell.md: NO mock chat, NO countdown banner,
 *   NO gradient CTA, NO dark theme, NO glow shadow
 * - 06-motion/motion-philosophy.md: calm > energetic, NO infinite floating
 */
export default function HeroSection() {
  return (
    <section className="relative bg-cream py-16 lg:py-24 px-6 lg:px-12 xl:px-20 overflow-hidden">
      <div className="max-w-[1120px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Text — col-span-7 left (Pattern C asymmetric) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-7 text-center lg:text-left"
          >
            <h1 className="font-display italic text-navy text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight">
              Cùng luyện IELTS
              <br />
              <span className="text-teal">với mình</span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              className="mt-6 lg:mt-8 text-lg lg:text-xl text-gray-700 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Mình giúp bạn từ Band 5.0 đến 7.5+ — phản hồi cụ thể, không
              cảm tính. Lintopus AI chấm Speaking 4 tiêu chí IELTS, Writing
              3 lần để giảm sai số.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
              className="mt-8 lg:mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4"
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-button bg-teal text-cream font-semibold text-lg hover:bg-teal-light active:scale-[0.97] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                Bắt đầu luyện
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>

              <a
                href="#how-it-works"
                className="text-base text-navy hover:text-teal-dark transition-colors duration-150 underline-offset-4 hover:underline"
              >
                Lingona là gì?
              </a>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-6 text-sm text-gray-600"
            >
              Free tier không cần thẻ — Pro 179k/tháng (sinh viên giảm 20%)
            </motion.p>
          </motion.div>

          {/* Mascot — col-span-5 right */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 12 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="lg:col-span-5 flex justify-center lg:justify-end"
          >
            <Mascot
              size={320}
              mood="happy"
              enableIdle
              priority
              alt="Lintopus — Lingona's mascot"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
