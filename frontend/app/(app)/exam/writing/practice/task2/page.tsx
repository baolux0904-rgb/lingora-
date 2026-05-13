"use client";

import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/AnimatedBackground";

const EditorialEssayPicker = dynamic(
  () => import("@/components/Writing/v2/EditorialEssayPicker"),
  { ssr: false },
);

export default function ExamWritingPracticeTask2Page() {
  return (
    <>
      <AnimatedBackground variant="minimal" />
      <EditorialEssayPicker taskType="task2" />
    </>
  );
}
