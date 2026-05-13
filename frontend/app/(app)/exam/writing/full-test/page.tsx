"use client";

/**
 * /exam/writing/full-test — v2 Full Test brief (pre-test instructions).
 * Replaces legacy WritingTab entry. Sub-routes:
 *   /active                          → FullTestEditor (2-tab editor)
 *   /[fullTestId]/result             → FullTestResultPage
 */

import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/AnimatedBackground";

const FullTestBrief = dynamic(
  () => import("@/components/Writing/v2/FullTestBrief"),
  { ssr: false },
);

export default function ExamWritingFullTestPage() {
  return (
    <>
      <AnimatedBackground variant="minimal" />
      <FullTestBrief />
    </>
  );
}
