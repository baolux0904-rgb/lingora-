"use client";

/**
 * ScenariosScreen — non-IELTS conversation scenarios.
 *
 * Reuses ScenarioList (which already supports excludeExam filter) and routes
 * selection back to /home-legacy for the ScenarioConversation session (legacy
 * god-component still owns multi-turn state until PR5).
 */

import { useRouter } from "next/navigation";
import ScenarioList from "@/components/ScenarioList";
import type { Scenario } from "@/lib/types";

export default function ScenariosScreen() {
  const router = useRouter();

  const handleSelect = (scenario: Scenario) => {
    router.push(`/home-legacy?tab=scenarios&scenario=${scenario.id}`);
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
