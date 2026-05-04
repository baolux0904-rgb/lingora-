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
 * FeaturesSection — Wave 6 Sprint 3.6 rebuild (production hotfix round 2).
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
 * - 09-anti-patterns/jargon-ban.md: end-user-facing copy uses "Lintopus AI",
 *   never "Whisper", "GPT-4o-mini", "LLM", "median", "multi-sampling".
 *
 * 6 specific Lingona features (verified against codebase):
 * - Speaking AI 4-criteria scoring
 * - Writing — 3 lần chấm độc lập (Lintopus AI)
 * - Reading — đầy đủ 5 dạng câu hỏi IELTS (Practice + Full Test)
 * - Listening 64 audio files (IELTS official source)
 * - Battle 1v1 (Iron → Challenger 8 ranks)
 * - Achievement 45 badges + streak system
 *
 * Sprint 3.6 changes (Louis production round-2 lock):
 * - Reading: drop "56 passages có sẵn" copy + 56-grid visual
 *   (Louis: "lộ rõ điểm yếu rồi" — exposed 12/56 progress).
 *   New copy lists 5 IELTS question types; new visual previews a hero
 *   passage card ("The Origin of Coffee").
 * - Speaking + Writing: scrub developer jargon (Whisper / GPT-4o-mini /
 *   LLM / multi-sampling / median) → branded "Lintopus AI" voice.
 *   Louis: "người dùng sẽ không hiểu gpt call rồi này nọ là gì".
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
      "Lintopus AI nghe phát âm + chấm 4 tiêu chí IELTS chính thức: " +
      "Fluency, Vocabulary, Grammar, Pronunciation — feedback cụ thể từng tiêu chí.",
    icon: Mic,
    side: "left",
  },
  {
    id: "writing",
    title: "Writing chấm 3 lần — giảm sai số",
    body:
      "Lintopus AI chấm 3 lần để giảm sai số — kết quả band ổn định hơn. " +
      "Phản hồi 4 tiêu chí: Task Achievement, Coherence, Lexical, Grammar.",
    icon: PenLine,
    side: "right",
  },
  {
    id: "reading",
    title: "Reading IELTS đầy đủ format",
    body:
      "Practice + Full Test mode. Đủ 5 dạng câu hỏi IELTS: Multiple Choice, " +
      "True / False / Not Given, Matching, Heading, Summary completion.",
    icon: BookOpen,
    side: "left",
  },
  {
    id: "listening",
    title: "Listening — bộ source IELTS official",
    body:
      "64 audio file từ bộ source IELTS official. 4 sections + answer " +
      "sheet đúng format chuẩn.",
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
 * Feature visual — refined preview cards per feature.
 * Sprint 2E commit 3 polish.
 *
 * Each visual = static JSX recreation of the feature's UI affordance.
 * NOT real screenshots (would require live DB + auth). Numbers chosen as
 * realistic-feel illustrations (per fake-stats-ban.md: NOT marketing
 * inflation — these are previews showing what the feature renders).
 */
function FeatureVisual({ featureId }: { featureId: string }) {
  switch (featureId) {
    case "speaking":
      return <SpeakingVisual />;
    case "writing":
      return <WritingVisual />;
    case "reading":
      return <ReadingVisual />;
    case "listening":
      return <ListeningVisual />;
    case "battle":
      return <BattleVisual />;
    case "achievement":
      return <AchievementVisual />;
    default:
      return <PlaceholderVisual />;
  }
}

/** Speaking — 4-criteria score card */
function SpeakingVisual() {
  const criteria = [
    { label: "Fluency & Coherence", score: 7.0 },
    { label: "Lexical Resource", score: 6.5 },
    { label: "Grammatical Range", score: 6.5 },
    { label: "Pronunciation", score: 7.0 },
  ];
  return (
    <div className="rounded-card border border-gray-200 bg-cream-warm p-6 shadow-sm">
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-xs font-semibold text-navy uppercase tracking-wide">
          Speaking band
        </span>
        <span className="font-display italic text-teal text-3xl">6.5</span>
      </div>
      <ul className="space-y-2.5">
        {criteria.map((c) => (
          <li
            key={c.label}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-gray-700">{c.label}</span>
            <span className="font-semibold text-navy">{c.score.toFixed(1)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Writing — 3 lần chấm độc lập (Lintopus AI) */
function WritingVisual() {
  const samples = [6.5, 7.0, 6.5];
  return (
    <div className="rounded-card border border-gray-200 bg-cream-warm p-6 shadow-sm">
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-xs font-semibold text-navy uppercase tracking-wide">
          3 lần chấm độc lập
        </span>
        <span className="font-display italic text-teal text-3xl">6.5</span>
      </div>
      <div className="flex items-end gap-3 h-24">
        {samples.map((s, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1.5 justify-end"
          >
            <div
              className="w-full bg-teal rounded-sm"
              style={{ height: `${(s / 9) * 100}%` }}
              aria-hidden="true"
            />
            <span className="text-[10px] text-gray-600">Lần {i + 1}</span>
            <span className="text-xs font-semibold text-navy">
              {s.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-600 text-center">
        Trung vị = band cuối
      </p>
    </div>
  );
}

/** Reading — hero passage card preview ("The Origin of Coffee" mock) */
function ReadingVisual() {
  return (
    <div className="rounded-card border border-gray-200 bg-cream-warm p-6 shadow-sm">
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-xs font-semibold text-navy uppercase tracking-wide">
          Academic Reading — Test mode
        </span>
        <span className="text-xs text-gray-600">20:00</span>
      </div>
      <h4 className="font-display italic text-navy text-lg leading-snug">
        The Origin of Coffee
      </h4>
      <p className="mt-2 text-xs text-gray-700 leading-relaxed line-clamp-4">
        Coffee is one of the most widely consumed beverages in the world,
        but its origins remain shrouded in legend. The most popular tale
        traces it to a 9th-century Ethiopian goatherd named Kaldi, who
        noticed his goats grew unusually energetic after eating the bright
        red berries of a particular shrub…
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
        <div className="rounded-sm bg-teal/10 text-teal px-2 py-1 font-semibold text-center">
          13 câu hỏi
        </div>
        <div className="rounded-sm bg-cream text-navy border border-gray-200 px-2 py-1 font-semibold text-center">
          Passage 1 / 3
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-600">
        <span>Cambridge IELTS format</span>
        <span className="text-teal font-semibold">Practice + Full Test</span>
      </div>
    </div>
  );
}

/** Listening — IELTS official source audio waveform */
function ListeningVisual() {
  const waveform = [4, 7, 5, 9, 6, 8, 5, 7, 4, 6, 8, 5, 7, 9, 5, 6, 4, 8, 6, 7];
  return (
    <div className="rounded-card border border-gray-200 bg-cream-warm p-6 shadow-sm">
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-xs font-semibold text-navy uppercase tracking-wide">
          Bộ source IELTS — Test 2
        </span>
        <span className="text-xs text-gray-600">02:47 / 30:00</span>
      </div>
      <div className="flex items-end gap-1 h-16 mb-4">
        {waveform.map((h, i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm ${
              i < 8 ? "bg-teal" : "bg-teal/30"
            }`}
            style={{ height: `${(h / 10) * 100}%` }}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="flex items-center justify-center text-xs text-gray-600">
        <span className="font-semibold text-teal">Bộ source IELTS official — 64 audio files</span>
      </div>
    </div>
  );
}

/** Battle — rank tier progression */
function BattleVisual() {
  const ranks = [
    "Iron",
    "Bronze",
    "Silver",
    "Gold",
    "Platinum",
    "Diamond",
    "Master",
    "Challenger",
  ];
  const currentIndex = 3; // Gold
  return (
    <div className="rounded-card border border-gray-200 bg-cream-warm p-6 shadow-sm">
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-xs font-semibold text-navy uppercase tracking-wide">
          Rank hiện tại
        </span>
        <span className="font-display italic text-teal text-2xl">Gold III</span>
      </div>
      <div className="flex items-center gap-1 mb-3">
        {ranks.map((r, i) => (
          <div
            key={r}
            className={`flex-1 h-1.5 rounded-full ${
              i <= currentIndex ? "bg-teal" : "bg-gray-200"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] text-gray-600">
        <span>Iron</span>
        <span>Challenger</span>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs">
        <span className="text-gray-700">Rating LP</span>
        <span className="font-semibold text-navy">1,240 LP</span>
      </div>
    </div>
  );
}

/** Achievement — badge gallery + streak */
function AchievementVisual() {
  const badges = Array.from({ length: 12 }).map((_, i) => i);
  const unlocked = new Set([0, 1, 2, 4, 5, 7]);
  return (
    <div className="rounded-card border border-gray-200 bg-cream-warm p-6 shadow-sm">
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-xs font-semibold text-navy uppercase tracking-wide">
          Achievement
        </span>
        <span className="font-display italic text-teal text-2xl">12 / 45</span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {badges.map((i) => {
          const isUnlocked = unlocked.has(i);
          return (
            <div
              key={i}
              className={`aspect-square rounded-button flex items-center justify-center ${
                isUnlocked ? "bg-teal text-cream" : "bg-gray-100 text-gray-400"
              }`}
              aria-hidden="true"
            >
              {isUnlocked ? (
                <Trophy className="w-4 h-4" />
              ) : (
                <span className="text-xs">?</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center gap-2 text-xs">
        <span className="text-gray-700">Streak hằng ngày:</span>
        <span className="font-semibold text-teal">14 ngày 🔥</span>
      </div>
    </div>
  );
}

/** Fallback for unknown featureId */
function PlaceholderVisual() {
  return (
    <div className="aspect-[4/3] rounded-card border border-gray-200 bg-cream-warm p-6 flex items-center justify-center">
      <span className="text-sm text-gray-500">Preview</span>
    </div>
  );
}
