"use client";

/**
 * /exam/reading/practice — Wave 6 Sprint 5L (2/3) Reading Practice
 * runner. Mounts ReadingTab without initialPhase (defaults to the
 * "home" practice picker — matches the /home-legacy?tab=reading&
 * mode=practice mapping at /home-legacy/page.tsx:243). First
 * dedicated mount point outside /home-legacy.
 *
 * Auth gated via the (app)/layout.tsx wrapper.
 */

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/AnimatedBackground";

const ReadingTab = dynamic(() => import("@/components/Reading/ReadingTab"), {
  ssr: false,
});

export default function ExamReadingPracticePage() {
  const router = useRouter();
  return (
    <>
      <AnimatedBackground variant="minimal" />
      <ReadingTab onClose={() => router.push("/exam/reading")} />
    </>
  );
}
