import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import Mascot from "@/components/ui/Mascot";

export const metadata = {
  title: "Help — Lingona",
  description: "Hỏi đáp Lingona — liên hệ qua email hoặc Facebook.",
};

export default function HelpPage() {
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
            Cần giúp gì?
          </h1>

          <p className="mt-6 text-base lg:text-lg text-gray-700 leading-relaxed max-w-md">
            FAQ + tutorial đang viết. Trong khi đó, mình trả lời nhanh qua
            email hoặc Facebook.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a
              href="mailto:hello@lingona.app"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-button bg-teal text-cream font-semibold text-base hover:bg-teal-light transition-colors duration-150"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              Email mình
            </a>
            <Link
              href="https://facebook.com/lingona.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-button border border-navy/20 text-navy font-semibold text-base hover:bg-navy/5 transition-colors duration-150"
            >
              Facebook Lingona
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
