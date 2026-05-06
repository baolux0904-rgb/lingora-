"use client";

/**
 * ScenariosScreen — non-IELTS conversation scenarios.
 *
 * Reuses ScenarioList (excludeExam filter) and routes selection to the
 * Sprint 5L (1/3) /learn/scenarios/[id] runner route. Pre-5L this
 * pushed to /home-legacy?tab=scenarios&scenario=...; the legacy mount
 * stays alive through 5L (3/3) for backwards compat but no live caller
 * targets it from here anymore.
 */

import { useRouter } from "next/navigation";
import ScenarioList from "./ScenarioList";
import type { Scenario } from "@/lib/types";

export default function ScenariosScreen() {
  const router = useRouter();

  const handleSelect = (scenario: Scenario) => {
    router.push(`/learn/scenarios/${scenario.id}`);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-display font-bold" style={{ color: "var(--color-text)" }}>
          Luyện tập nói theo tình huống
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Hội thoại đời thường với AI: gọi taxi, khám bệnh, order cafe…
        </p>
      </div>

      <ScenarioList onSelect={handleSelect} excludeExam />
    </div>
  );
}
