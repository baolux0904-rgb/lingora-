"use client";

/**
 * /exam/speaking/[id] — Wave 6 Sprint 5L (1/3) IELTS Speaking runner.
 *
 * Mounts IeltsConversationV2 for the scenario id in the URL. First
 * dedicated mount point for the IELTS speaking session outside
 * /home-legacy. Sprint 5L (3/3) drops /home-legacy entirely; this
 * route is the durable replacement.
 *
 * Auth gated via the (app)/layout.tsx wrapper.
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/AnimatedBackground";
import Mascot from "@/components/ui/Mascot";
import { getScenarios } from "@/lib/api";
import type { Scenario } from "@/lib/types";

const IeltsConversationV2 = dynamic(
  () => import("@/components/Speaking/IeltsConversationV2"),
  { ssr: false },
);

export default function ExamSpeakingRunnerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const scenarioId = params?.id ?? "";

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scenarioId) return;
    let cancelled = false;
    getScenarios()
      .then((list) => {
        if (cancelled) return;
        const match = list.find((s) => s.id === scenarioId);
        if (!match) {
          setError("Không tìm thấy đề thi");
          return;
        }
        if (match.exam_type !== "ielts") {
          setError("Đề này không phải IELTS Speaking");
          return;
        }
        setScenario(match);
      })
      .catch(() => {
        if (!cancelled) setError("Không tải được đề thi");
      });
    return () => {
      cancelled = true;
    };
  }, [scenarioId]);

  if (error) {
    return (
      <div className="min-h-dvh relative bg-cream flex items-center justify-center px-6">
        <AnimatedBackground variant="subtle" />
        <div className="relative max-w-md text-center">
          <Mascot size={120} mood="happy" />
          <p className="mt-6 text-base text-navy">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/exam/speaking")}
            className="mt-6 px-6 py-3 rounded-md bg-teal text-cream font-sans font-semibold text-base hover:bg-teal-light active:bg-teal-dark transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            Quay lại chọn đề
          </button>
        </div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="min-h-dvh relative bg-cream flex items-center justify-center">
        <AnimatedBackground variant="subtle" />
        <div className="relative w-8 h-8 border-2 border-gray-200 border-t-teal rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <IeltsConversationV2
      scenario={scenario}
      onClose={() => router.push("/exam/speaking")}
      onComplete={() => {
        /* gamification refresh handled by AppDataContext layer */
      }}
    />
  );
}
