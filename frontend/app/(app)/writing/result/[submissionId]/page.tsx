"use client";

import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/AnimatedBackground";

const PracticeResultPage = dynamic(
  () => import("@/components/Writing/v2/PracticeResultPage"),
  { ssr: false },
);

export default function WritingResultRoute({
  params,
}: {
  params: { submissionId: string };
}) {
  return (
    <>
      <AnimatedBackground variant="minimal" />
      <PracticeResultPage submissionId={params.submissionId} />
    </>
  );
}
