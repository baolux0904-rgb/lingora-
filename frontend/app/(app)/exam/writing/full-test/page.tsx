"use client";

/**
 * /exam/writing/full-test — Wave 6 Sprint 5L (2/3) Writing Full Test
 * runner. Mounts WritingTab with initialMode="full_test". First
 * dedicated mount point outside /home-legacy. Sprint 5L (3/3) drops
 * the legacy alongside this commit's runner stays.
 *
 * Auth gated via the (app)/layout.tsx wrapper.
 */

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/AnimatedBackground";

const WritingTab = dynamic(() => import("@/components/Writing/WritingTab"), {
  ssr: false,
});

export default function ExamWritingFullTestPage() {
  const router = useRouter();
  return (
    <>
      <AnimatedBackground variant="minimal" />
      <WritingTab
        onClose={() => router.push("/exam/writing")}
        initialMode="full_test"
      />
    </>
  );
}
