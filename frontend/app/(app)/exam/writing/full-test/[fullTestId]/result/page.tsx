"use client";

import dynamic from "next/dynamic";
import AnimatedBackground from "@/components/AnimatedBackground";

const FullTestResultPage = dynamic(
  () => import("@/components/Writing/v2/FullTestResultPage"),
  { ssr: false },
);

export default function WritingFullTestResultRoute({
  params,
}: {
  params: { fullTestId: string };
}) {
  return (
    <>
      <AnimatedBackground variant="minimal" />
      <FullTestResultPage fullTestId={params.fullTestId} />
    </>
  );
}
