"use client";

import { motion } from "framer-motion";
import Mascot, { type MascotMood } from "@/components/ui/Mascot";

/**
 * HowItWorksSection — Wave 6 Sprint 2C rebuild.
 *
 * Per .claude/skills/lingona-design:
 * - 02-layout/desktop-canvas.md: 3-col grid for steps (md:grid-cols-3)
 * - 03-components/mascot.md: Lintopus mood progression default → thinking → happy
 * - 05-voice/persona.md: peer voice 'mình/bạn'
 * - 06-motion/framer-variants.md: stagger reveal 120ms per step
 * - 11-references/jschallenger-extract.md: try-first pattern (low friction entry)
 *
 * Vietnamese learner journey: try free → save with account → daily commitment.
 *
 * Note: Step 1 'try without register' = future implementation (backend session
 * + result claim flow needed). Sprint 2C describes the flow visually + textually.
 * Try-first feature implementation deferred (post-launch backlog).
 */

interface Step {
  number: string;
  title: string;
  body: string;
  mood: MascotMood;
  bubble: string;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Thử ngay không cần đăng ký",
    body:
      "Vào thử 1 bài Speaking với AI — nhận band score và feedback ngay. " +
      "Không cần email, không cần tài khoản.",
    mood: "default",
    bubble: "Cùng thử",
  },
  {
    number: "02",
    title: "Lưu tiến độ với tài khoản",
    body:
      "Đăng nhập để lưu kết quả + theo dõi journey từ band hiện tại tới " +
      "mục tiêu. Lintopus đồng hành cả lộ trình.",
    mood: "thinking",
    bubble: "Mình giúp bạn track",
  },
  {
    number: "03",
    title: "Luyện hằng ngày + Battle",
    body:
      "Daily missions, streak counter, Battle 1v1 với học viên khác. " +
      "Tới band 7+ với rhythm bền.",
    mood: "happy",
    bubble: "Vững từ đây",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-cream py-20 lg:py-28 px-6 lg:px-12 xl:px-20 border-t border-gray-200"
    >
      <div className="max-w-[1120px] mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="font-display italic text-navy text-3xl lg:text-5xl leading-tight tracking-tight">
            Bắt đầu thế nào?
          </h2>
          <p className="mt-4 text-base lg:text-lg text-gray-700 max-w-2xl mx-auto">
            3 bước, không bắt đăng ký ngay từ đầu.
          </p>
        </div>

        {/* Steps grid — 3-col desktop, stack mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.4,
        delay: index * 0.12,
        ease: "easeOut",
      }}
      className="flex flex-col items-center text-center"
    >
      {/* Step number */}
      <span className="font-display italic text-teal text-5xl lg:text-6xl leading-none">
        {step.number}
      </span>

      {/* Mascot inline with bubble */}
      <div className="mt-6">
        <Mascot
          size={100}
          mood={step.mood}
          bubble={step.bubble}
          bubblePosition="below"
        />
      </div>

      {/* Title */}
      <h3 className="mt-6 font-display italic text-navy text-xl lg:text-2xl leading-tight">
        {step.title}
      </h3>

      {/* Body */}
      <p className="mt-3 text-base text-gray-700 leading-relaxed max-w-xs">
        {step.body}
      </p>
    </motion.div>
  );
}
