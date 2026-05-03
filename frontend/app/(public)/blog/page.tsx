import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Mascot from "@/components/ui/Mascot";

export const metadata = {
  title: "Blog Lingona",
  description: "Tips IELTS, study guides, và update Lingona — sắp ra mắt.",
};

export default function BlogPage() {
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
          <Mascot size={120} mood="default" />

          <h1 className="mt-8 font-display italic text-navy text-3xl lg:text-5xl leading-tight">
            Blog
          </h1>

          <p className="mt-6 text-base lg:text-lg text-gray-700 leading-relaxed max-w-md">
            Mình đang chuẩn bị tip IELTS, study guides, update Lingona. Sắp ra
            mắt sau khi launch chính thức.
          </p>

          <p className="mt-3 text-sm text-gray-600 max-w-md">
            Trong khi đợi, follow Lingona qua Facebook để không miss update:
          </p>

          <Link
            href="https://facebook.com/lingona.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-button bg-teal text-cream font-semibold text-base hover:bg-teal-light transition-colors duration-150"
          >
            Follow Facebook Lingona
          </Link>
        </div>
      </div>
    </main>
  );
}
