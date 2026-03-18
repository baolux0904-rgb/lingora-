"use client";

import { useState, useEffect } from "react";
import { IconMic, IconHeadphones, IconOpenBook, IconPen } from "./Icons";
import { getScenarios } from "@/lib/api";
import type { Scenario } from "@/lib/types";

interface ExamScreenProps {
  onStartIelts: (scenario: Scenario) => void;
}

interface ExamModule {
  id: string;
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  available: boolean;
  accentColor: string;
}

const EXAM_MODULES: ExamModule[] = [
  {
    id: "speaking",
    title: "IELTS Speaking",
    subtitle: "Full 3-part speaking test simulation with AI examiner",
    Icon: IconMic,
    available: true,
    accentColor: "#7C5CFC",
  },
  {
    id: "listening",
    title: "IELTS Listening",
    subtitle: "Audio-based comprehension practice",
    Icon: IconHeadphones,
    available: false,
    accentColor: "#38BDF8",
  },
  {
    id: "reading",
    title: "IELTS Reading",
    subtitle: "Passage analysis and question practice",
    Icon: IconOpenBook,
    available: false,
    accentColor: "#34D399",
  },
  {
    id: "writing",
    title: "IELTS Writing",
    subtitle: "Task 1 & Task 2 essay practice with scoring",
    Icon: IconPen,
    available: false,
    accentColor: "#FBBF24",
  },
];

export default function ExamScreen({ onStartIelts }: ExamScreenProps) {
  const [ieltsScenario, setIeltsScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getScenarios("exam")
      .then((scenarios) => {
        if (cancelled) return;
        const ielts = scenarios.find((s) => s.exam_type === "ielts");
        if (ielts) setIeltsScenario(ielts);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2
          className="text-xl font-sora font-bold"
          style={{ color: "var(--color-text)" }}
        >
          Exam Practice
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Prepare for English proficiency exams
        </p>
      </div>

      {/* Exam cards */}
      <div className="flex flex-col gap-4">
        {EXAM_MODULES.map((mod) => {
          const isAvailable = mod.available;
          const isLoading = mod.id === "speaking" && loading;

          return (
            <button
              key={mod.id}
              onClick={() => {
                if (isAvailable && ieltsScenario) {
                  onStartIelts(ieltsScenario);
                }
              }}
              disabled={!isAvailable || isLoading || (mod.id === "speaking" && !ieltsScenario)}
              className="relative flex items-center gap-4 p-5 rounded-2xl text-left transition-all duration-200 card-hover disabled:cursor-default disabled:hover:transform-none"
              style={{
                background: "var(--color-bg-card)",
                border: isAvailable
                  ? `1px solid ${mod.accentColor}30`
                  : "1px solid var(--color-border)",
                opacity: isAvailable ? 1 : 0.6,
              }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: isAvailable
                    ? `${mod.accentColor}18`
                    : "var(--color-primary-soft)",
                  color: isAvailable ? mod.accentColor : "var(--color-text-secondary)",
                }}
              >
                <mod.Icon size={22} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="font-semibold text-[15px]"
                    style={{ color: "var(--color-text)" }}
                  >
                    {mod.title}
                  </span>
                  {!isAvailable && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--color-primary-soft)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Coming Soon
                    </span>
                  )}
                </div>
                <p
                  className="text-sm mt-0.5 leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {mod.subtitle}
                </p>
              </div>

              {/* Arrow for available */}
              {isAvailable && (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: mod.accentColor }}
                  className="shrink-0"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
