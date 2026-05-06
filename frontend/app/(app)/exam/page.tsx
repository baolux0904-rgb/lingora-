"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/AnimatedBackground";
import Topbar from "@/components/Topbar";
import { useAppData } from "@/contexts/AppDataContext";
import type { Scenario } from "@/lib/types";

const ExamScreen = dynamic(() => import("@/components/ExamScreen"), { ssr: false });

export default function ExamPage() {
  const router = useRouter();
  const { displayStreak } = useAppData();

  return (
    <div className="min-h-dvh relative bg-exam">
      <AnimatedBackground variant="minimal" />
      <div className="lg:hidden">
        <Topbar streak={displayStreak} />
      </div>
      <div className="mx-auto px-5 py-6 max-w-2xl lg:max-w-4xl animate-fadeSlideUp">
        <ExamScreen
          // Wave 6 Sprint 5L (3/3) — direct runner routes. Was
          // /home-legacy?tab=speaking&scenario=${s.id} (3 sites).
          onStartIelts={(s: Scenario) =>
            router.push(`/exam/speaking/${s.id}`)
          }
          onStartWriting={() => router.push("/exam/writing")}
          onStartReading={() => router.push("/exam/reading")}
          onScenarioSelect={(s: Scenario) => {
            if (s.exam_type === "ielts") {
              router.push(`/exam/speaking/${s.id}`);
            } else {
              router.push(`/learn/scenarios/${s.id}`);
            }
          }}
        />
      </div>
    </div>
  );
}
