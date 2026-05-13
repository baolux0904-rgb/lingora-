"use client";

/**
 * /exam/writing/practice — v2 Task picker landing (Task 1 / Task 2).
 * Replaces legacy WritingTab entry. Sub-routes:
 *   /task1, /task2  → EditorialEssayPicker
 *   /[questionId]    → PracticeEditor
 *   /writing/result/[submissionId]  → PracticeResultPage
 */

import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/AnimatedBackground";

const TaskPickerLanding = dynamic(
  () => import("@/components/Writing/v2/TaskPickerLanding"),
  { ssr: false },
);

export default function ExamWritingPracticePage() {
  return (
    <>
      <AnimatedBackground variant="minimal" />
      <TaskPickerLanding />
    </>
  );
}
