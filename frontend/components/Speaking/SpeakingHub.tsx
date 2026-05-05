"use client";

/**
 * SpeakingHub — IELTS Speaking scenario picker.
 *
 * Filters the global scenario list to exam_type === "ielts" and routes
 * selection to /home-legacy for the conversation session (legacy god-component
 * still owns the multi-turn session state until PR5 + Mode Selection).
 */

import { useRouter } from "next/navigation";
import { useScenarios } from "@/hooks/useScenarios";
import Badge from "@/components/ui/Badge";
import type { Scenario } from "@/lib/types";

export default function SpeakingHub() {
  const router = useRouter();
  const { scenarios: rawScenarios, loading, error } = useScenarios();
  const scenarios = rawScenarios.filter((s) => s.exam_type === "ielts");

  const handleSelect = (scenario: Scenario) => {
    router.push(`/home-legacy?tab=speaking&scenario=${scenario.id}`);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-display font-bold" style={{ color: "var(--color-text)" }}>
          IELTS Speaking
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Full 3-part speaking test with an AI examiner
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div
            style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-primary)" }}
            className="w-8 h-8 border-2 rounded-full animate-spin"
          />
        </div>
      )}

      {error && (
        <div className="text-center py-10 text-base" style={{ color: "var(--color-warning)" }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-3 stagger-children">
          {scenarios.length === 0 && (
            <div className="text-center py-10 text-base" style={{ color: "var(--color-text-secondary)" }}>
              Chưa có đề Speaking IELTS nào.
            </div>
          )}

          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => handleSelect(scenario)}
              className="flex items-center gap-4 p-4 rounded-lg text-left transition duration-normal card-hover"
              style={{
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: "var(--color-primary-soft)" }}
              >
                {scenario.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base truncate" style={{ color: "var(--color-text)" }}>
                  {scenario.title}
                </div>
                <div className="text-sm mt-0.5 line-clamp-1" style={{ color: "var(--color-text-secondary)" }}>
                  {scenario.description}
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="primary" size="sm">{scenario.difficulty}</Badge>
                  <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    ~{scenario.expected_turns} turns
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
