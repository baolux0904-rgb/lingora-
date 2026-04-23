"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ReadingTab = dynamic(() => import("@/components/Reading/ReadingTab"), { ssr: false });

export default function ExamReadingPage() {
  const router = useRouter();
  return <ReadingTab onClose={() => router.push("/exam")} />;
}
