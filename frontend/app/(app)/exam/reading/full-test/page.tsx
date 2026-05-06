"use client";

/**
 * /exam/reading/full-test — Wave 6 Sprint 5L (2/3) Reading Full Test
 * runner. Mounts ReadingTab with initialPhase="full_test_select"
 * (matches the /home-legacy?tab=reading&mode=full_test mapping at
 * /home-legacy/page.tsx:244). First dedicated mount point outside
 * /home-legacy.
 *
 * Auth gated via the (app)/layout.tsx wrapper.
 */

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/AnimatedBackground";

const ReadingTab = dynamic(() => import("@/components/Reading/ReadingTab"), {
  ssr: false,
});

export default function ExamReadingFullTestPage() {
  const router = useRouter();
  return (
    <>
      <AnimatedBackground variant="minimal" />
      <ReadingTab
        onClose={() => router.push("/exam/reading")}
        initialPhase="full_test_select"
      />
    </>
  );
}
