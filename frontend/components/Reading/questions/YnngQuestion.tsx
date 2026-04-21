"use client";

/**
 * YnngQuestion — Yes / No / Not Given (opinions).
 * Mirror of TfngQuestion with a different button label set.
 */

interface YnngQuestionProps {
  answer: string;
  onAnswer: (a: string) => void;
}

const OPTIONS: Array<{ value: string; label: string }> = [
  { value: "Y", label: "YES" },
  { value: "N", label: "NO" },
  { value: "NG", label: "NOT GIVEN" },
];

export default function YnngQuestion({ answer, onAnswer }: YnngQuestionProps) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => {
        const selected = answer === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onAnswer(opt.value)}
            className="flex-1 py-3 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: selected ? "rgba(0,168,150,0.12)" : "var(--color-bg-secondary)",
              border: `1px solid ${selected ? "rgba(0,168,150,0.4)" : "var(--color-border)"}`,
              color: selected ? "#00A896" : "var(--color-text-secondary)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
