"use client";

/**
 * WritingCorrectionDrawer — slide-in panel for the Level 2 highlight view.
 *
 * Shows either:
 *   - a sentence-level correction (multiple corrections stack if one
 *     sentence carries more than one flag)
 *   - a paragraph-level feedback block (paragraph score + icon notes)
 *
 * Desktop: fixed right edge, ~400px wide.
 * Mobile : full-screen sheet.
 * Close  : X button, Escape key, backdrop click.
 *
 * Wave 6 Sprint 5C.3c — restyled to cream canon (bg-cream-warm,
 * border-navy/10, text-navy / text-navy-light, font-sans DM Sans).
 * All 47 functional var(--*) refs eliminated. Sprint 5A.2 closure
 * commit for Sprint 5C.3 polish series.
 *
 * Lesson 3 semantic preservation (CRITICAL):
 *   - Error-type color helper (errorTypeColor): grammar=navy,
 *     vocabulary=teal, coherence=coral — semantic categorical colors,
 *     preserved verbatim. Default fallback migrated to slate hex
 *     (matches bandColor sub-5.0 dignified neutral).
 *   - Paragraph icon color helper (iconColor): coherence=coral,
 *     band_upgrade=amber, good_structure=teal, task_response=navy,
 *     lexical_highlight=purple — semantic indicator palette,
 *     preserved verbatim.
 *   - Paragraph score badges: emerald (strong) / amber (adequate) /
 *     coral (weak) — semantic verdict, preserved verbatim.
 *   - Sentence corrected callout: teal accent (brand "good" semantic).
 *   - Band-aware callout: navy accent (brand exam-mode semantic).
 *   - Pro tips callout: purple accent (off-brand but semantic
 *     "advanced/elevated" — preserved per 5C.1e WritingParaphraseChips
 *     precedent of intentional palette diversity for distinction).
 *
 * Pattern 7 NUANCE (5C.3b): errorTypeColor + iconColor return hex
 * strings used as dynamic style{{ background, color, borderLeft }}
 * injection — inline pattern preserved.
 *
 * Pattern 5 (branded scrim): drawer overlay rgba(0,0,0,0.35) →
 * bg-navy/40 backdrop-blur-sm.
 */

import { useEffect, useState } from "react";
import { getWritingProgressContext } from "@/lib/api";
import type {
  SentenceCorrection,
  ParagraphAnalysis,
  WritingErrorType,
  ParagraphIconType,
  WritingProgressContext,
  WritingProgressPattern,
} from "@/lib/types";

export type WritingDrawerDetail =
  | { kind: "sentence"; corrections: SentenceCorrection[] }
  | { kind: "paragraph"; paragraph: ParagraphAnalysis };

type StyleTab = "basic" | "band" | "pro" | "progress";

interface WritingCorrectionDrawerProps {
  open: boolean;
  detail: WritingDrawerDetail | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  /** Submission id used by the Style F tab to fetch recurring-error patterns. */
  submissionId?: string | null;
}

// Slate fallback for unknown error types (matches Soul-rule sub-5.0
// dignified neutral from bandColor helper).
const ERROR_TYPE_FALLBACK_COLOR = "#5C6B85";

function errorTypeColor(type: WritingErrorType | undefined) {
  switch (type) {
    case "grammar":     return "#1B2B4B";
    case "vocabulary":  return "#00A896";
    case "coherence":   return "#F07167";
    default:            return ERROR_TYPE_FALLBACK_COLOR;
  }
}

function errorTypeLabel(type: WritingErrorType | undefined): string {
  switch (type) {
    case "grammar":     return "Ngữ pháp";
    case "vocabulary":  return "Từ vựng";
    case "coherence":   return "Liên kết";
    default:            return "Lỗi";
  }
}

function iconEmoji(type: ParagraphIconType): string {
  switch (type) {
    case "coherence":           return "⚠️";
    case "band_upgrade":        return "💡";
    case "good_structure":      return "✅";
    case "task_response":       return "🎯";
    case "lexical_highlight":   return "💎";
  }
}

function iconColor(type: ParagraphIconType): string {
  switch (type) {
    case "coherence":           return "#F07167";
    case "band_upgrade":        return "#F9A826";
    case "good_structure":      return "#00A896";
    case "task_response":       return "#1B2B4B";
    case "lexical_highlight":   return "#7E4EC1";
  }
}

function iconLabel(type: ParagraphIconType): string {
  switch (type) {
    case "coherence":           return "Liên kết";
    case "band_upgrade":        return "Nâng band";
    case "good_structure":      return "Cấu trúc tốt";
    case "task_response":       return "Bám đề";
    case "lexical_highlight":   return "Từ vựng";
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface ProgressPanelProps {
  loading: boolean;
  error: string | null;
  context: WritingProgressContext | null;
  enabled: boolean;
}

function ProgressPanel({ loading, error, context, enabled }: ProgressPanelProps) {
  if (!enabled) {
    return (
      <p className="text-sm italic text-center py-6 text-navy-light/70">
        Không có submission để phân tích.
      </p>
    );
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <p
        className="text-sm rounded-lg px-3 py-2"
        style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444" }}
      >
        {error}
      </p>
    );
  }
  if (!context) return null;
  if (context.insufficient_data) {
    return (
      <div className="rounded-lg px-4 py-5 text-sm text-center bg-cream-soft text-navy-light border border-dashed border-navy/10">
        Hoàn thành thêm bài viết để thấy phân tích tiến độ (cần ≥10 bài). Hiện có {context.sample_size}.
      </div>
    );
  }
  if (context.patterns.length === 0) {
    return (
      <p className="text-sm italic text-center py-6 text-navy-light/70">
        Chưa phát hiện pattern lặp lại nào — great sign!
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {context.patterns.map((p, i) => (
        <PatternCard key={i} pattern={p} />
      ))}
    </div>
  );
}

function PatternCard({ pattern }: { pattern: WritingProgressPattern }) {
  const color =
    pattern.pattern_type === "error_type"
      ? errorTypeColor(pattern.error_type)
      : "#7E4EC1";
  const label =
    pattern.pattern_type === "error_type"
      ? errorTypeLabel(pattern.error_type)
      : "Issue lặp lại";

  return (
    <div
      className="rounded-lg p-3 flex flex-col gap-2 bg-cream-soft"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
          style={{ background: `${color}15`, color }}
        >
          {label}
        </span>
        <span className="text-xs font-semibold text-navy">
          {pattern.occurrences} bài
        </span>
      </div>
      {pattern.example_issue && (
        <p className="text-sm leading-relaxed text-navy">
          “{pattern.example_issue}”
        </p>
      )}
      <div className="text-xs text-navy-light/70">
        {formatDate(pattern.first_seen_date)} → {formatDate(pattern.last_seen_date)}
      </div>
    </div>
  );
}

export default function WritingCorrectionDrawer({
  open,
  detail,
  onClose,
  onPrev,
  onNext,
  submissionId,
}: WritingCorrectionDrawerProps) {
  const [activeTab, setActiveTab] = useState<StyleTab>("basic");
  const [progress, setProgress] = useState<WritingProgressContext | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Reset tab state + progress cache whenever a new detail opens.
  useEffect(() => {
    if (detail) setActiveTab("basic");
  }, [detail]);

  // Lazy-load progress only when the user actually opens the Tiến độ tab.
  useEffect(() => {
    if (activeTab !== "progress") return;
    if (!submissionId) return;
    if (progress || progressLoading) return;
    setProgressLoading(true);
    setProgressError(null);
    getWritingProgressContext(submissionId)
      .then((ctx) => setProgress(ctx))
      .catch((err) => setProgressError(err instanceof Error ? err.message : "Không tải được dữ liệu tiến độ"))
      .finally(() => setProgressLoading(false));
  }, [activeTab, submissionId, progress, progressLoading]);

  if (!open || !detail) return null;

  const isSentence = detail.kind === "sentence";

  return (
    <div
      className="fixed inset-0 z-[70] flex md:justify-end bg-navy/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="flex flex-col w-full md:w-[420px] md:h-full h-full md:shadow-2xl bg-cream-warm border-l border-navy/10 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-navy/10">
          <div className="flex items-center gap-2">
            {(onPrev || onNext) && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={!onPrev}
                  className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 bg-cream-soft text-navy hover:bg-cream transition-colors"
                  aria-label="Lỗi trước"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!onNext}
                  className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 bg-cream-soft text-navy hover:bg-cream transition-colors"
                  aria-label="Lỗi sau"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            )}
            <div className="font-semibold text-sm text-navy">
              {detail.kind === "sentence"
                ? `Lỗi câu (${detail.corrections.length})`
                : `Đoạn ${detail.paragraph.paragraph_number}`}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-cream-soft text-navy hover:bg-cream transition-colors"
            aria-label="Đóng"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Inner style tab bar — only for sentence corrections */}
        {isSentence && (
          <div className="flex shrink-0 overflow-x-auto border-b border-navy/10 bg-cream-soft">
            {([
              { key: "basic",    label: "Basic" },
              { key: "band",     label: "Band-aware" },
              { key: "pro",      label: "Pro tips" },
              { key: "progress", label: "Tiến độ" },
            ] as { key: StyleTab; label: string }[]).map((t) => {
              const active = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={
                    "flex-1 py-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap border-b-2 " +
                    (active
                      ? "text-teal border-teal bg-cream-warm"
                      : "text-navy-light border-transparent hover:text-navy")
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          {/* ── Sentence mode — Basic tab (Style A) ── */}
          {isSentence && activeTab === "basic" && detail.corrections.map((c, idx) => (
            <div key={idx} className="flex flex-col gap-3">
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider self-start"
                style={{ background: `${errorTypeColor(c.error_type)}15`, color: errorTypeColor(c.error_type) }}
              >
                {errorTypeLabel(c.error_type)}
              </span>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-1 text-navy-light/70">
                  Câu gốc
                </div>
                <p className="text-sm leading-relaxed text-navy">
                  {c.original}
                </p>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-1 text-navy-light/70">
                  Sửa thành
                </div>
                <p
                  className="text-sm leading-relaxed rounded-lg px-3 py-2 text-navy bg-teal/10 border-l-[3px] border-teal"
                >
                  {c.corrected}
                </p>
              </div>

              {c.explanation && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-1 text-navy-light/70">
                    Tại sao
                  </div>
                  <p className="text-sm leading-relaxed text-navy-light">
                    {c.explanation}
                  </p>
                </div>
              )}

              {idx < detail.corrections.length - 1 && (
                <div className="h-px bg-navy/10" />
              )}
            </div>
          ))}

          {/* ── Sentence mode — Band-aware tab (Style D) ── */}
          {isSentence && activeTab === "band" && (
            <div className="flex flex-col gap-3">
              {detail.corrections.map((c, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-navy-light/70">
                    Lỗi {idx + 1} · Ảnh hưởng band
                  </div>
                  {c.band_context ? (
                    <p className="text-sm leading-relaxed rounded-lg px-3 py-3 text-navy bg-navy/5 border-l-[3px] border-navy">
                      {c.band_context}
                    </p>
                  ) : (
                    <p className="text-sm italic text-navy-light/70">
                      Đang cập nhật phân tích band…
                    </p>
                  )}
                  {idx < detail.corrections.length - 1 && (
                    <div className="h-px bg-navy/10" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Sentence mode — Pro tips tab (Style E) ── */}
          {isSentence && activeTab === "pro" && (
            <div className="flex flex-col gap-3">
              {detail.corrections.map((c, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-navy-light/70">
                    Phiên bản band 8+
                  </div>
                  {c.pro_version ? (
                    <p
                      className="text-sm leading-relaxed rounded-lg px-3 py-3 text-navy"
                      style={{ background: "rgba(126,78,193,0.06)", borderLeft: "3px solid #7E4EC1" }}
                    >
                      {c.pro_version}
                    </p>
                  ) : (
                    <p className="text-sm italic text-navy-light/70">
                      Đang cập nhật phiên bản nâng cao…
                    </p>
                  )}
                  {idx < detail.corrections.length - 1 && (
                    <div className="h-px bg-navy/10" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Sentence mode — Tiến độ tab (Style F) ── */}
          {isSentence && activeTab === "progress" && (
            <ProgressPanel
              loading={progressLoading}
              error={progressError}
              context={progress}
              enabled={!!submissionId}
            />
          )}

          {detail.kind === "paragraph" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-cream-soft text-navy-light border border-navy/10">
                  {detail.paragraph.type}
                </span>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{
                    background: detail.paragraph.score === "strong" ? "rgba(22,163,74,0.10)" : detail.paragraph.score === "weak" ? "rgba(239,68,68,0.10)" : "rgba(245,158,11,0.10)",
                    color:      detail.paragraph.score === "strong" ? "#16A34A" : detail.paragraph.score === "weak" ? "#EF4444" : "#F59E0B",
                  }}
                >
                  {detail.paragraph.score}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-navy">
                {detail.paragraph.feedback}
              </p>

              {detail.paragraph.highlight_phrase && (
                <p className="text-sm italic leading-relaxed rounded-lg px-3 py-2 text-navy bg-navy/5 border-l-[3px] border-navy">
                  “{detail.paragraph.highlight_phrase}”
                </p>
              )}

              {detail.paragraph.icons && detail.paragraph.icons.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-navy-light/70">
                    Ghi chú
                  </div>
                  {detail.paragraph.icons.map((icon, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-lg px-3 py-2 bg-cream-soft"
                      style={{ borderLeft: `3px solid ${iconColor(icon.type)}` }}
                    >
                      <span className="text-lg leading-none shrink-0">{iconEmoji(icon.type)}</span>
                      <div>
                        <div className="text-xs font-semibold" style={{ color: iconColor(icon.type) }}>
                          {iconLabel(icon.type)}
                        </div>
                        <p className="text-sm text-navy">{icon.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Future Style D/E/F placeholders — wired up, content lands in Item 7 */}
              <div className="rounded-lg px-3 py-3 text-xs bg-cream-soft text-navy-light/70 border border-dashed border-navy/10">
                Sắp có: gợi ý band upgrade (Style D), câu mẫu học thuộc (Style E), tiến bộ theo thời gian (Style F).
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
