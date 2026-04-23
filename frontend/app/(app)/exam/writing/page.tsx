"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const WritingTab = dynamic(() => import("@/components/Writing/WritingTab"), { ssr: false });

export default function ExamWritingPage() {
  const router = useRouter();
  return <WritingTab onClose={() => router.push("/exam")} />;
}
