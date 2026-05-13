"use client";

/**
 * SubBandGrid — 4-column typography grid for the 4 IELTS Writing criteria.
 * Mobile: 2 columns.
 */

interface SubBandCell {
  englishLabel: string;
  vietnameseLabel: string;
  score: number | null;
}

interface SubBandGridProps {
  task: number | null;
  coherence: number | null;
  lexical: number | null;
  grammar: number | null;
}

export default function SubBandGrid({
  task,
  coherence,
  lexical,
  grammar,
}: SubBandGridProps) {
  const cells: SubBandCell[] = [
    { englishLabel: "Task Response", vietnameseLabel: "Trả lời đề bài", score: task },
    { englishLabel: "Coherence", vietnameseLabel: "Liên kết & mạch lạc", score: coherence },
    { englishLabel: "Lexical", vietnameseLabel: "Từ vựng", score: lexical },
    { englishLabel: "Grammar", vietnameseLabel: "Ngữ pháp", score: grammar },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 my-8">
      {cells.map((c) => (
        <div key={c.englishLabel}>
          <div
            className="text-[10px] uppercase tracking-[0.16em] mb-1.5"
            style={{ color: "rgba(0, 168, 150, 0.7)" }}
          >
            {c.englishLabel}
          </div>
          <div
            className="font-display italic text-[28px] leading-none tabular-nums"
            style={{ color: "var(--color-text)" }}
          >
            {c.score !== null ? c.score.toFixed(1) : "—"}
          </div>
          <div
            className="text-[11px] mt-1.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {c.vietnameseLabel}
          </div>
        </div>
      ))}
    </div>
  );
}
