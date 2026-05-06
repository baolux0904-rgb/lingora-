"use client";

/**
 * /exam/writing/practice — Wave 6 Sprint 5L (2/3) Writing Practice
 * runner. Mounts WritingTab with initialMode="practice". First
 * dedicated mount point outside /home-legacy.
 *
 * Auth gated via the (app)/layout.tsx wrapper.
 */

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/AnimatedBackground";

const WritingTab = dynamic(() => import("@/components/Writing/WritingTab"), {
  ssr: false,
});

export default function ExamWritingPracticePage() {
  const router = useRouter();
  return (
    <>
      <AnimatedBackground variant="minimal" />
      <WritingTab
        onClose={() => router.push("/exam/writing")}
        initialMode="practice"
      />
    </>
  );
}
