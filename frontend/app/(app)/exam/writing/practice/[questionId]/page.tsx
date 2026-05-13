"use client";

import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/AnimatedBackground";

const PracticeEditor = dynamic(
  () => import("@/components/Writing/v2/PracticeEditor"),
  { ssr: false },
);

export default function ExamWritingPracticeQuestionPage({
  params,
}: {
  params: { questionId: string };
}) {
  return (
    <>
      <AnimatedBackground variant="minimal" />
      <PracticeEditor questionId={params.questionId} />
    </>
  );
}
