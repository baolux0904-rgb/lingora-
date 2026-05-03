"use client";

import { motion } from "framer-motion";
import {
  Mic,
  PenLine,
  BookOpen,
  Headphones,
  Swords,
  Trophy,
  type LucideIcon,
} from "lucide-react";

/**
 * FeaturesSection — Wave 6 Sprint 2C rebuild.
 *
 * Per .claude/skills/lingona-design:
 * - 02-layout/desktop-canvas.md: Pattern C alternating asymmetric per feature row
 *   (text col-7 + visual col-5, alternate sides L→R→L→R→L→R)
 * - 02-layout/grid-vs-flow.md: flow narrative (NOT card grid for features)
 * - 03-components/card-language.md: feature visual placeholder card pattern
 * - 05-voice/persona.md + microcopy-library.md: peer voice Vietnamese-first
 * - 09-anti-patterns/ai-generated-smell.md: NO 'Fast/Smart/Secure' generic pillars,
 *   NO 'Trusted by' logos, NO testimonials carousel
 * - 09-anti-patterns/fake-stats-ban.md: only specific verifiable claims,
 *   no fabricated user counts / band averages / satisfaction %
 *
 * 6 specific Lingona features (verified against codebase):
 * - Speaking AI 4-criteria scoring (Whisper + LLM)
 * - Writing 3x multi-sampling (GPT-4o-mini median)
 * - Reading 56 passages (Cambridge-style)
 * - Listening Cam 10/11/12/14 (64 audio files)
 * - Battle 1v1 (Iron → Challenger 8 ranks)
 * - Achievement 45 badges + streak system
 *
 * Visual blocks ship as placeholder cards. Sprint 2E polish refines each
 * with real data preview (band score card / rank badge / streak ring / etc.).
 */

interface Feature {
  id: string;
  title: string;
  body: string;
  icon: LucideIcon;
  side: "left" | "right";
}

const features: Feature[] = [
  {
    id: "speaking",
    title: "Speaking AI chấm theo 4 tiêu chí IELTS",
    body:
      "Fluency, Vocabulary, Grammar, Pronunciation — feedback cụ thể từng " +
      "tiêu chí. Whisper transcribe + LLM scoring.",
    icon: Mic,
    side: "left",
  },
  {
    id: "writing",
    title: "Writing chấm 3x giảm noise",
    body:
      "GPT-4o-mini chấm 3 lần độc lập, lấy median band score. Phản hồi 4 " +
      "tiêu chí: Task Achievement, Coherence, Lexical, Grammar.",
    icon: PenLine,
    side: "right",
  },
  {
    id: "reading",
    title: "Reading 56 passages có sẵn",
    body:
      "Practice + Full Test mode. Cambridge-style passages với MCQ, " +
      "T/F/NG, Matching, Heading, Summary.",
    icon: BookOpen,
    side: "left",
  },
  {
    id: "listening",
    title: "Listening — Cambridge audio chuẩn IELTS",
    body:
      "Cam 10, 11, 12, 14 — 64 audio file thi thật. 4 sections + answer " +
      "sheet đúng format Cambridge.",
    icon: Headphones,
    side: "right",
  },
  {
    id: "battle",
    title: "Battle 1v1 — luyện trong áp lực",
    body:
      "Đấu Reading async với học viên khác. Iron → Challenger 8 rank tier. " +
      "LP system, leaderboard top 100.",
    icon: Swords,
    side: "left",
  },
  {
    id: "achievement",
    title: "45 thành tựu + streak hằng ngày",
    body:
      "Mở khóa 45 badge qua 8 category. Streak counter, daily missions, " +
      "level up — Lintopus theo bạn cả journey.",
    icon: Trophy,
    side: "right",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="bg-cream py-20 lg:py-28 px-6 lg:px-12 xl:px-20"
    >
      <div className="max-w-[1120px] mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="font-display italic text-navy text-3xl lg:text-5xl leading-tight tracking-tight">
            Cụ thể từng tính năng
          </h2>
          <p className="mt-4 text-base lg:text-lg text-gray-700 max-w-2xl mx-auto">
            Không marketing chung chung. Từng feature mình chia sẻ đúng những
            gì Lingona đang có.
          </p>
        </div>

        {/* Features list — alternating Pattern C asymmetric rows */}
        <div className="space-y-20 lg:space-y-32">
          {features.map((feature, index) => (
            <FeatureRow key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureRow({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;
  const isTextLeft = feature.side === "left";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
    >
      {/* Text block */}
      <div
        className={`lg:col-span-7 ${
          isTextLeft ? "lg:order-1" : "lg:order-2"
        }`}
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-button bg-teal/10 mb-5">
          <Icon className="w-6 h-6 text-teal" aria-hidden="true" />
        </div>

        <h3 className="font-display italic text-navy text-2xl lg:text-3xl leading-tight">
          {feature.title}
        </h3>

        <p className="mt-4 text-base lg:text-lg text-gray-700 leading-relaxed max-w-xl">
          {feature.body}
        </p>
      </div>

      {/* Visual block — placeholder card (Sprint 2E polish refines per feature) */}
      <div
        className={`lg:col-span-5 ${
          isTextLeft ? "lg:order-2" : "lg:order-1"
        }`}
      >
        <FeatureVisual featureId={feature.id} />
      </div>
    </motion.div>
  );
}

/**
 * Feature visual — minimal placeholder per feature.
 * Sprint 2E polish: refine each visual with real data preview / illustration.
 * For Sprint 2C v1: cream-warm card with subtle border + feature label.
 */
function FeatureVisual({ featureId }: { featureId: string }) {
  return (
    <div className="aspect-[4/3] rounded-card border border-gray-200 bg-cream-warm p-6 flex items-center justify-center">
      <span className="text-sm text-gray-500 italic">
        {featureId} preview
      </span>
    </div>
  );
}
