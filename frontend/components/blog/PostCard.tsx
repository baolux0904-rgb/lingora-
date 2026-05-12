import Link from "next/link";
import type { BlogPostMeta } from "@/lib/blog/types";

function formatVnDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function PostCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block rounded-lg border border-navy/10 bg-cream-warm p-5 lg:p-6 hover:border-navy/25 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
    >
      <h2 className="font-display italic text-[22px] lg:text-[24px] leading-snug text-navy">
        {post.title}
      </h2>
      <p
        className="mt-3 font-sans text-[15px] lg:text-[16px] leading-[1.6] text-navy/70 overflow-hidden"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {post.excerpt}
      </p>
      <p className="mt-4 font-sans text-[13px] lg:text-[14px] text-navy/50 tabular-nums">
        {formatVnDate(post.publishedAt)} · {post.readingTime} phút đọc
      </p>
    </Link>
  );
}
