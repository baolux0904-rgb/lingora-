"use client";

import React, { useState, useRef } from "react";
import {
  Sun,
  Utensils,
  Plane,
  Briefcase,
  Users,
  GraduationCap,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { useScenarios } from "@/hooks/useScenarios";
import { useDailyLimits } from "@/hooks/useDailyLimits";
import { useOnboardingStatus } from "@/lib/hooks/useOnboardingStatus";
import OnboardingGateModal from "@/components/Onboarding/OnboardingGateModal";
import Mascot from "@/components/ui/Mascot";
import UpgradeTrigger from "@/components/Pro/UpgradeTrigger";
import RemainingBadge from "@/components/Pro/RemainingBadge";
import ProUpgradeModal from "@/components/Pro/ProUpgradeModal";
import type { Scenario } from "@/lib/types";

const CATEGORY_ICON: Record<string, LucideIcon> = {
  daily: Sun,
  food: Utensils,
  travel: Plane,
  work: Briefcase,
  social: Users,
  academic: GraduationCap,
};

interface ScenarioListProps {
  onSelect: (scenario: Scenario) => void;
  excludeExam?: boolean;
}

const CATEGORIES = [
  { key: undefined, label: "Tất cả" },
  { key: "daily", label: "Hàng ngày" },
  { key: "food", label: "Ăn uống" },
  { key: "travel", label: "Du lịch" },
  { key: "work", label: "Công việc" },
  { key: "social", label: "Xã hội" },
  { key: "academic", label: "Học thuật" },
] as const;

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "cơ bản",
  intermediate: "trung cấp",
  advanced: "nâng cao",
};

const DIFFICULTY_BADGE_CLASS: Record<string, string> = {
  beginner: "bg-teal/10 text-teal",
  intermediate: "bg-navy/10 text-navy",
  advanced: "bg-amber-100 text-amber-700",
};

const ScenarioCard = React.memo(function ScenarioCard({
  scenario,
  onSelect,
}: {
  scenario: Scenario;
  onSelect: (s: Scenario) => void;
}) {
  const Icon = CATEGORY_ICON[scenario.category ?? ""] ?? MessageSquare;
  const diffClass =
    DIFFICULTY_BADGE_CLASS[scenario.difficulty] ?? "bg-navy/5 text-navy/70";

  return (
    <button
      onClick={() => onSelect(scenario)}
      className="flex items-center gap-4 p-4 sm:p-5 rounded-lg text-left transition-colors duration-fast card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="w-16 h-16 rounded-lg flex items-center justify-center shrink-0 bg-teal/10 text-teal-dark">
        <Icon size={24} strokeWidth={2} aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <div
          className="font-display italic text-[20px] sm:text-[22px] leading-tight truncate"
          style={{ color: "var(--color-text)" }}
        >
          {scenario.title}
        </div>
        <div
          className="text-[15px] sm:text-[16px] mt-1 line-clamp-2 leading-snug"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {scenario.description}
        </div>
        <div
          className="flex items-center gap-2 mt-2.5 text-[13px] sm:text-[14px]"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${diffClass}`}
          >
            {DIFFICULTY_LABEL[scenario.difficulty] ?? scenario.difficulty}
          </span>
          <span aria-hidden="true" className="opacity-60">·</span>
          <span className="tabular-nums">~{scenario.expected_turns} lượt</span>
        </div>
      </div>

      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-text-secondary)" }} className="shrink-0">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
});

export default function ScenarioList({ onSelect, excludeExam }: ScenarioListProps) {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const { scenarios: rawScenarios, loading, error } = useScenarios(activeCategory);
  const limits = useDailyLimits();
  const onboarding = useOnboardingStatus();
  const [proModalOpen, setProModalOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const pendingScenarioRef = useRef<Scenario | null>(null);
  const gateSkipped = useRef(false);

  const scenarios = excludeExam
    ? rawScenarios.filter((s) => s.exam_type !== "ielts")
    : rawScenarios;

  // Gate speaking scenarios: free-user daily-limit gate first, then
  // Wave 6 Sprint 4E.2 onboarding soft-gate before the scenario session
  // starts (cheapest insertion point — fires before any LLM round-trip).
  const handleSelect = (scenario: Scenario) => {
    if (!limits.isPro && !limits.speaking.allowed) {
      setProModalOpen(true);
      return;
    }
    if (
      !gateSkipped.current &&
      onboarding.status &&
      !onboarding.status.has_completed_onboarding
    ) {
      pendingScenarioRef.current = scenario;
      setGateOpen(true);
      return;
    }
    onSelect(scenario);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2
          className="text-xl font-bold"
          style={{ color: "var(--color-text)" }}
        >
          Tình huống nói
        </h2>
        <RemainingBadge
          type="speaking"
          bucket={limits.speaking}
          hidden={limits.loading || limits.isPro}
        />
      </div>

      {/* Limit-hit banner — only renders when used >= limit */}
      {!limits.loading && !limits.isPro && !limits.speaking.allowed && (
        <UpgradeTrigger
          type="speaking"
          used={limits.speaking.used}
          limit={limits.speaking.limit ?? 0}
          onUpgrade={() => setProModalOpen(true)}
        />
      )}

      <ProUpgradeModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        onUpgraded={() => {
          setProModalOpen(false);
          limits.refetch();
        }}
      />

      <OnboardingGateModal
        open={gateOpen}
        onComplete={() => {
          setGateOpen(false);
          pendingScenarioRef.current = null;
          window.dispatchEvent(new Event("lingona:open-onboarding"));
        }}
        onSkip={() => {
          setGateOpen(false);
          gateSkipped.current = true;
          const pending = pendingScenarioRef.current;
          pendingScenarioRef.current = null;
          if (pending) onSelect(pending);
        }}
        headline="Lintopus cần biết band hiện tại"
        body="Để chọn cuộc hội thoại phù hợp với trình độ của bạn."
      />

      {/* Category filter pills */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(cat.key)}
              aria-pressed={isActive}
              className={[
                "px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap shrink-0 min-h-[44px]",
                "transition-colors duration-fast",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
                isActive
                  ? "bg-teal text-cream shadow-colored"
                  : "bg-navy/5 text-navy/70 hover:bg-navy/10 hover:text-navy",
              ].join(" ")}
            >
              {cat.label}
            </button>
          );
        })}
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
          {scenarios.length === 0 ? (
            <div className="max-w-[480px] mx-auto py-16 text-center flex flex-col items-center gap-5">
              <p className="text-base" style={{ color: "var(--color-text-secondary)" }}>
                Chưa có tình huống trong nhóm này.
              </p>
              <Mascot size={80} mood="default" />
              <button
                type="button"
                onClick={() => setActiveCategory(undefined)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-teal hover:text-teal-dark transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-md px-2 py-1"
              >
                Xem tất cả tình huống
                <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
            scenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} onSelect={handleSelect} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
