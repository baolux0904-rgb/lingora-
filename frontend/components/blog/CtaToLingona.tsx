import Link from "next/link";
import type { ReactNode } from "react";

interface CtaToLingonaProps {
  href?: string;
  children?: ReactNode;
}

/**
 * Subtle inline CTA used 1–2x mid-post. Default label points to the
 * diagnostic flow on /register. Pass `children` to override copy.
 */
export default function CtaToLingona({
  href = "/register",
  children = "Thử bài chẩn đoán Lingona miễn phí",
}: CtaToLingonaProps) {
  return (
    <p className="my-8 font-sans text-[16px] lg:text-[17px]">
      <Link
        href={href}
        className="inline-flex items-baseline gap-2 text-navy hover:text-teal transition-colors duration-150 underline underline-offset-4 decoration-navy/30 hover:decoration-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded"
      >
        <span aria-hidden="true" className="text-teal">→</span>
        <span>{children}</span>
      </Link>
    </p>
  );
}
