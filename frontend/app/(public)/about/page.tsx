import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Mascot from "@/components/ui/Mascot";

export const metadata = {
  title: "Về Lingona",
  description:
    "Lingona là gì — IELTS prep app cho người Việt với AI scoring rigorous + Lintopus companion.",
};

export default function AboutPage() {
  return (
    <main className="bg-cream min-h-screen py-16 lg:py-24 px-6 lg:px-12 xl:px-20">
      <div className="max-w-[720px] mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-navy hover:text-teal transition-colors duration-150 mb-12"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Về landing
        </Link>

        <div className="flex flex-col items-center text-center">
          <Mascot size={120} mood="thinking" />

          <h1 className="mt-8 font-display italic text-navy text-3xl lg:text-5xl leading-tight">
            Về Lingona
          </h1>

          <p className="mt-6 text-base lg:text-lg text-gray-700 leading-relaxed max-w-md">
            Trang Về Lingona đang được mình viết kĩ. Trong khi đợi, bạn có thể
            xem cách Lingona giúp bạn luyện IELTS ở landing.
          </p>

          <Link
            href="/#how-it-works"
            className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-button bg-teal text-cream font-semibold text-base hover:bg-teal-light transition-colors duration-150"
          >
            Xem cách Lingona hoạt động
          </Link>
        </div>
      </div>
    </main>
  );
}
