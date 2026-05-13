"use client";

import dynamic from "next/dynamic";

const FullTestEditor = dynamic(
  () => import("@/components/Writing/v2/FullTestEditor"),
  { ssr: false },
);

export default function ExamWritingFullTestActivePage() {
  // FullTestEditor owns its own full-screen chrome (timer bar + bg) so we
  // skip the AnimatedBackground wrapper here. The timer must be the
  // first visible element above the editor.
  return <FullTestEditor />;
}
