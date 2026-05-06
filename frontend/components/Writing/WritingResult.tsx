"use client";

/**
 * WritingResult.tsx — Displays IELTS Writing scoring results.
 *
 * Shows: overall band, 4 criteria cards, strengths/weaknesses,
 * sentence corrections, and collapsible sample essay.
 *
 * Wave 6 Sprint 5C.1b — restyled to cream canon (bg-cream-warm,
 * border-navy/10, font-display Playfair, font-sans DM Sans). Absorbs
 * Sprint 5H.2 inline soft band display: big band number, 4-col
 * subscore row (TR/CC/LR/GRA), subtle horizontal band visualizer 0→9.
 * Per Soul rule: band score never displayed in red — bandColor() helper
 * uses dignified slate for sub-5.0.
 */

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import FeedbackSheet from "@/components/FeedbackSheet";
import WritingEssayHighlighted from "./WritingEssayHighlighted";
import WritingCorrectionDrawer, { type WritingDrawerDetail } from "./WritingCorrectionDrawer";
import WritingParagraphIcons from "./WritingParagraphIcons";
import WritingSampleComparison from "./WritingSampleComparison";
import WritingParaphraseChips from "./WritingParaphraseChips";
import WritingSelfCompareBanner from "./WritingSelfCompareBanner";
import { bandColor } from "@/lib/bandColors";
import type { WritingSubmission, WritingFeedback, WritingFeedbackCard, ParagraphAnalysis, WritingEssayType } from "@/lib/types";

type ResultTab = "summary" | "highlight" | "compare";

const ESSAY_TYPE_LABEL: Record<WritingEssayType, string> = {
  opinion: "Quan điểm",
  discussion: "Thảo luận",
  problem_solution: "Vấn đề & giải pháp",
  advantages_disadvantages: "Ưu & nhược điểm",
  two_part_question: "Câu hỏi 2 phần",
};

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

interface WritingResultProps {
  submission: WritingSubmission;
  onBack: () => void;
}

/**
 * Sprint 5H.2 inline subscore chip — short label + score, dignified.
 * Used inside the Overall Band card, one per criterion.
 */
function SubscoreChip({ label, score }: { label: string; score: number }) {
  const color = bandColor(score);
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase tracking-wider font-medium text-navy-light/70 font-sans">
        {label}
      </span>
      <span className="font-display text-xl text-navy" style={{ color }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

/**
 * Sprint 5H.2 horizontal band visualizer — 0→9 axis with marker at
 * overall band. Subtle, non-alarming. Marker color from bandColor().
 */
function BandVisualizer({ band }: { band: number }) {
  const pct = Math.max(0, Math.min(9, band)) / 9 * 100;
  const color = bandColor(band);
  return (
    <div className="mt-4 px-1">
      <div className="relative h-1.5 rounded-full bg-navy/10">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color, opacity: 0.7 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full ring-2 ring-cream"
          style={{ left: `${pct}%`, background: color }}
          aria-hidden="true"
        />
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-navy-light/60 font-sans">
        <span>0</span>
        <span>3</span>
        <span>6</span>
        <span>9</span>
      </div>
    </div>
  );
}

function CriteriaCard({
  label,
  score,
  feedback,
  color,
}: {
  label: string;
  score: number;
  feedback: string;
  color: string;
}) {
  return (
    <div
      className="rounded-lg p-4 bg-cream-warm border border-navy/10"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-navy font-sans">
          {label}
        </span>
        <span className="text-lg font-bold font-display" style={{ color }}>
          {score.toFixed(1)}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-navy-light font-sans">
        {feedback}
      </p>
    </div>
  );
}

export default function WritingResult({ submission, onBack }: WritingResultProps) {
  const router = useRouter();
  const [showFeedback, setShowFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState<ResultTab>("summary");
  const [drawerDetail, setDrawerDetail] = useState<WritingDrawerDetail | null>(null);
  const feedbackShown = useRef(false);
  const feedback = submission.feedback_json as WritingFeedback | null;

  // Index corrections by normalized sentence so a click on the highlighted
  // essay can look up every correction attached to that sentence.
  const correctionsBySentence = useMemo(() => {
    const map = new Map<string, typeof feedback extends null ? never : NonNullable<typeof feedback>["sentence_corrections"]>();
    for (const c of feedback?.sentence_corrections ?? []) {
      if (!c?.original) continue;
      const key = normalize(c.original);
      const existing = map.get(key) ?? [];
      existing.push(c);
      map.set(key, existing);
    }
    return map;
  }, [feedback]);

  const handleSentenceClick = (normalizedKey: string) => {
    const hits = correctionsBySentence.get(normalizedKey);
    if (hits && hits.length > 0) {
      setDrawerDetail({ kind: "sentence", corrections: hits });
    }
  };

  const handleParagraphClick = (paraNum: number) => {
    const para = (feedback?.paragraph_analysis ?? []).find((p) => p?.paragraph_number === paraNum);
    if (para) setDrawerDetail({ kind: "paragraph", paragraph: para });
  };

  // Show feedback sheet once when completed result first renders
  useEffect(() => {
    if (submission.status === "completed" && feedback && !feedbackShown.current) {
      feedbackShown.current = true;
      const t = setTimeout(() => setShowFeedback(true), 1000);
      return () => clearTimeout(t);
    }
  }, [submission.status, feedback]);

  if (!feedback) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-navy-light font-sans">
          Scoring data is not available for this submission.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-teal text-white font-sans"
        >
          Go Back
        </button>
      </div>
    );
  }

  const overall = feedback.overall_band;
  const color = bandColor(overall);

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium self-start text-teal font-sans hover:text-teal-dark transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      {/* Overall Band Score — Sprint 5H.2 absorption: big band number,
          4-col subscore row, horizontal band visualizer 0→9. */}
      <div className="rounded-xl p-6 text-center bg-cream-warm border border-navy/10 shadow-sm">
        <div className="text-sm font-medium mb-1 text-navy-light font-sans">
          Overall Band Score
        </div>
        <div
          className="font-display text-6xl leading-none mb-2"
          style={{ color }}
        >
          {overall.toFixed(1)}
        </div>
        <div className="text-xs flex items-center justify-center flex-wrap gap-2 text-navy-light/70 font-sans">
          <span>{submission.task_type === "task1" ? "Task 1" : "Task 2"} &middot; {submission.word_count} words</span>
          {feedback.essay_type && feedback.essay_type !== null && ESSAY_TYPE_LABEL[feedback.essay_type] && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider text-white bg-navy">
              Dạng bài: {ESSAY_TYPE_LABEL[feedback.essay_type]}
            </span>
          )}
          {feedback.language_detected && feedback.language_detected !== "en" && (
            <span className="px-1.5 py-0.5 rounded text-xs bg-warning/15 text-warning">
              Language: {feedback.language_detected.toUpperCase()}
            </span>
          )}
        </div>

        {/* 4-col subscore row — TR / CC / LR / GRA */}
        <div className="mt-5 grid grid-cols-4 gap-2 pt-4 border-t border-navy/10">
          <SubscoreChip label="TR" score={feedback.criteria.task.score} />
          <SubscoreChip label="CC" score={feedback.criteria.coherence.score} />
          <SubscoreChip label="LR" score={feedback.criteria.lexical.score} />
          <SubscoreChip label="GRA" score={feedback.criteria.grammar.score} />
        </div>

        {/* Horizontal band visualizer 0→9 */}
        <BandVisualizer band={overall} />
      </div>

      {/* Self-compare banner — silent if previous month has no submissions */}
      <WritingSelfCompareBanner currentBand={feedback.overall_band ?? null} />

      {/* Word Count Analysis */}
      {feedback.word_count_feedback && (
        <div className="rounded-lg px-4 py-3 flex items-center gap-3" style={{
          background: feedback.word_count_feedback.status === "good" ? "rgba(34,197,94,0.06)" : "rgba(245,158,11,0.06)",
          border: `1px solid ${feedback.word_count_feedback.status === "good" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)"}`,
        }}>
          <span className="text-base">{feedback.word_count_feedback.status === "good" ? "✅" : "⚠️"}</span>
          <div>
            <div className="text-sm font-medium text-navy font-sans">
              {feedback.word_count_feedback.actual} words
            </div>
            <div className="text-xs text-navy-light font-sans">
              {feedback.word_count_feedback.comment}
            </div>
          </div>
        </div>
      )}

      {/* Tab toggle: Summary (default) / Highlight detail */}
      <div className="flex rounded-xl overflow-hidden bg-cream-warm border border-navy/10">
        {([
          { key: "summary",   label: "Tóm tắt" },
          { key: "highlight", label: "Highlight chi tiết" },
          { key: "compare",   label: "So sánh mẫu" },
        ] as { key: ResultTab; label: string }[]).map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={
                "flex-1 py-2.5 text-sm font-medium transition-all cursor-pointer font-sans " +
                (active ? "bg-teal text-white" : "bg-transparent text-navy-light")
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Highlight tab — essay + inline underlines + paragraph icons */}
      {activeTab === "highlight" && (
        <div className="flex flex-col gap-4">
          <WritingEssayHighlighted
            essayText={submission.essay_text}
            corrections={feedback.sentence_corrections ?? []}
            onCorrectionClick={handleSentenceClick}
          />
          {feedback.paragraph_analysis && feedback.paragraph_analysis.length > 0 && (
            <WritingParagraphIcons
              essayText={submission.essay_text}
              paragraphs={feedback.paragraph_analysis}
              onParagraphClick={handleParagraphClick}
            />
          )}
          <div className="rounded-lg px-3 py-2 text-xs flex items-center gap-3 bg-cream-warm border border-navy/10 text-navy-light font-sans">
            <span>Màu gạch chân:</span>
            <span style={{ color: "#1B2B4B" }}>● ngữ pháp</span>
            <span style={{ color: "#00A896" }}>● từ vựng</span>
            <span style={{ color: "#F07167" }}>● liên kết</span>
          </div>

          <WritingParaphraseChips suggestions={feedback.paraphrase_suggestions} />
        </div>
      )}

      {/* Compare tab — side-by-side vs sample band 7+ */}
      {activeTab === "compare" && (
        <WritingSampleComparison
          userEssay={submission.essay_text}
          sampleAnswer={feedback.sample_essay ?? ""}
          userBand={feedback.overall_band}
        />
      )}

      {/* Summary tab — original result layout */}
      {activeTab === "summary" && (
      <>
      {/* 4 Criteria Cards — detailed feedback per criterion. The
          at-a-glance scores live in the Overall card subscore row above. */}
      <div className="flex flex-col gap-3">
        <CriteriaCard
          label="Task Achievement"
          score={feedback.criteria.task.score}
          feedback={feedback.criteria.task.feedback}
          color={bandColor(feedback.criteria.task.score)}
        />
        <CriteriaCard
          label="Coherence & Cohesion"
          score={feedback.criteria.coherence.score}
          feedback={feedback.criteria.coherence.feedback}
          color={bandColor(feedback.criteria.coherence.score)}
        />
        <CriteriaCard
          label="Lexical Resource"
          score={feedback.criteria.lexical.score}
          feedback={feedback.criteria.lexical.feedback}
          color={bandColor(feedback.criteria.lexical.score)}
        />
        <CriteriaCard
          label="Grammatical Range & Accuracy"
          score={feedback.criteria.grammar.score}
          feedback={feedback.criteria.grammar.feedback}
          color={bandColor(feedback.criteria.grammar.score)}
        />
      </div>

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <div
          className="rounded-lg p-4"
          style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}
        >
          <div className="text-sm font-semibold mb-2 font-sans" style={{ color: "#22C55E" }}>
            Strengths
          </div>
          <ul className="flex flex-col gap-1.5">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="text-sm flex gap-2 text-navy font-sans">
                <span style={{ color: "#22C55E" }}>+</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {feedback.weaknesses.length > 0 && (
        <div
          className="rounded-lg p-4"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
        >
          <div className="text-sm font-semibold mb-2 font-sans" style={{ color: "#EF4444" }}>
            Areas to Improve
          </div>
          <ul className="flex flex-col gap-1.5">
            {feedback.weaknesses.map((w, i) => (
              <li key={i} className="text-sm flex gap-2 text-navy font-sans">
                <span style={{ color: "#EF4444" }}>-</span> {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {feedback.improvements.length > 0 && (
        <div
          className="rounded-lg p-4"
          style={{ background: "rgba(0,168,150,0.06)", border: "1px solid rgba(0,168,150,0.15)" }}
        >
          <div className="text-sm font-semibold mb-2 text-teal font-sans">
            Suggestions
          </div>
          <ul className="flex flex-col gap-1.5">
            {feedback.improvements.map((imp, i) => (
              <li key={i} className="text-sm flex gap-2 text-navy font-sans">
                <span className="text-teal">*</span> {imp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sentence Corrections */}
      {feedback.sentence_corrections.length > 0 && (
        <div className="rounded-lg p-4 flex flex-col gap-3 bg-cream-warm border border-navy/10">
          <div className="text-sm font-semibold text-navy font-sans">
            Sentence Corrections
          </div>
          {feedback.sentence_corrections.map((sc, i) => (
            <div key={i} className="flex flex-col gap-1 text-sm font-sans">
              <div className="flex gap-2">
                <span style={{ color: "#EF4444" }}>-</span>
                <span className="text-navy-light line-through">
                  {sc.original}
                </span>
              </div>
              <div className="flex gap-2">
                <span style={{ color: "#22C55E" }}>+</span>
                <span className="text-navy">
                  {sc.corrected}
                </span>
              </div>
              <div className="text-xs pl-5 text-navy-light/70">
                {sc.explanation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Cards */}
      {feedback.feedback_cards && feedback.feedback_cards.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="text-sm font-semibold text-navy font-sans">Key Feedback</div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 md:grid md:grid-cols-2 md:overflow-visible">
            {feedback.feedback_cards.map((card: WritingFeedbackCard, i: number) => {
              const cfg: Record<string, { border: string; bg: string; icon: string }> = {
                grammar_error:    { border: "#EF4444", bg: "rgba(239,68,68,0.06)", icon: "G" },
                vocab_repetition: { border: "#F59E0B", bg: "rgba(245,158,11,0.06)", icon: "V" },
                coherence:        { border: "#F97316", bg: "rgba(249,115,22,0.06)", icon: "C" },
                task_achievement: { border: "#3B82F6", bg: "rgba(59,130,246,0.06)", icon: "T" },
                strength:         { border: "#22C55E", bg: "rgba(34,197,94,0.06)", icon: "+" },
              };
              const c = cfg[card.type] || cfg.grammar_error;
              return (
                <div key={i} className="rounded-lg p-4 min-w-[280px] md:min-w-0 shrink-0"
                  style={{ background: c.bg, borderLeft: `4px solid ${c.border}`, animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{ background: `${c.border}20`, color: c.border }}>{c.icon}</span>
                    <span className="text-sm font-semibold text-navy font-sans">{card.title}</span>
                  </div>
                  <p className="text-xs mb-2 text-navy-light font-sans">{card.impact}</p>
                  {card.fix.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {card.fix.map((f, j) => (
                        <span key={j} className="px-2 py-0.5 rounded-full text-xs font-medium font-sans"
                          style={{ background: `${c.border}12`, color: c.border }}>{f}</span>
                      ))}
                    </div>
                  )}
                  {card.example && (
                    <p className="text-xs italic text-navy-light font-sans">{card.example}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Paragraph Analysis */}
      {feedback.paragraph_analysis && feedback.paragraph_analysis.length > 0 && (
        <div className="rounded-lg p-4 flex flex-col gap-2.5 bg-cream-warm border border-navy/10">
          <div className="text-sm font-semibold text-navy font-sans">Paragraph Breakdown</div>
          {feedback.paragraph_analysis.map((p: ParagraphAnalysis) => {
            const scoreCfg = { strong: { icon: "✅", color: "#22C55E" }, adequate: { icon: "⚠️", color: "#F59E0B" }, weak: { icon: "❌", color: "#EF4444" } };
            const sc = scoreCfg[p.score] || scoreCfg.adequate;
            return (
              <div
                key={p.paragraph_number}
                className={
                  "flex items-start gap-3 py-2 " +
                  (p.paragraph_number > 1 ? "border-t border-navy/10" : "")
                }
              >
                <span className="text-sm shrink-0 pt-0.5">{sc.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium capitalize text-navy font-sans">{p.type}</span>
                    <span className="text-xs font-medium capitalize font-sans" style={{ color: sc.color }}>{p.score}</span>
                  </div>
                  <p className="text-xs text-navy-light font-sans">{p.feedback}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sample Essay (collapsible) */}
      {feedback.sample_essay && (
        <details className="rounded-lg overflow-hidden bg-cream-warm border border-navy/10">
          <summary className="px-4 py-4 cursor-pointer text-sm font-semibold flex items-center justify-between text-navy font-sans">
            <span>Band 7.5+ Model Answer</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="text-navy-light/70"><polyline points="6 9 12 15 18 9" /></svg>
          </summary>
          <div className="px-4 pb-4 border-t border-navy/10">
            <p className="text-xs mb-2 pt-3 text-teal font-sans">
              Notice: specific examples, varied vocabulary, clear structure
            </p>
            <div className="text-sm leading-relaxed whitespace-pre-wrap text-navy-light font-sans">
              {feedback.sample_essay}
            </div>
          </div>
        </details>
      )}

      {/* Top 3 Priorities */}
      {feedback.top_3_priorities && feedback.top_3_priorities.length > 0 && (
        <div className="rounded-lg p-4 flex flex-col gap-2.5 bg-cream-warm border border-navy/10">
          <div className="text-sm font-semibold text-navy font-sans">
            Your Focus for Next Essay
          </div>
          {feedback.top_3_priorities.map((p, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 bg-teal/12 text-teal font-sans">{i + 1}</span>
              <p className="text-sm leading-relaxed text-navy font-sans">{p}</p>
            </div>
          ))}
        </div>
      )}

      </>
      )}

      {/* Wave 2.9: history entry point — parity with Speaking. */}
      <button
        onClick={() => router.push("/writing/history")}
        className="w-full py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] bg-cream-warm border border-navy/10 text-navy-light hover:text-navy font-sans"
      >
        Xem lịch sử Writing
      </button>

      <WritingCorrectionDrawer
        open={drawerDetail !== null}
        detail={drawerDetail}
        onClose={() => setDrawerDetail(null)}
        submissionId={submission.id}
      />

      <FeedbackSheet
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        activityType="writing"
        activityId={submission.id}
      />
    </div>
  );
}
