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
          onStartIelts={(s: Scenario) =>
            router.push(`/home-legacy?tab=speaking&scenario=${s.id}`)
          }
          onStartWriting={() => router.push("/exam/writing")}
          onStartReading={() => router.push("/exam/reading")}
          onScenarioSelect={(s: Scenario) => {
            if (s.exam_type === "ielts") {
              router.push(`/home-legacy?tab=speaking&scenario=${s.id}`);
            } else {
              router.push(`/home-legacy?tab=scenarios&scenario=${s.id}`);
            }
          }}
        />
      </div>
    </div>
  );
}
