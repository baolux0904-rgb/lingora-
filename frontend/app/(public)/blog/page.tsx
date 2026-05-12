import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Mascot from "@/components/ui/Mascot";
import PostCard from "@/components/blog/PostCard";
import { getAllPosts } from "@/lib/blog/posts";

export const metadata = {
  title: "Blog Lingona — Luyện IELTS thông minh hơn",
  description:
    "Mình viết về cách luyện IELTS hiệu quả hơn — không trung tâm, không tài liệu cũ, không lý thuyết suông.",
  openGraph: {
    title: "Blog Lingona — Luyện IELTS thông minh hơn",
    description:
      "Mình viết về cách luyện IELTS hiệu quả hơn — không trung tâm, không tài liệu cũ, không lý thuyết suông.",
    url: "https://lingona.app/blog",
    siteName: "Lingona",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog Lingona — Luyện IELTS thông minh hơn",
    description:
      "Mình viết về cách luyện IELTS hiệu quả hơn — không trung tâm, không tài liệu cũ, không lý thuyết suông.",
  },
  alternates: { canonical: "https://lingona.app/blog" },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main className="bg-cream min-h-screen text-navy">
      {/* Back link */}
      <div className="max-w-[960px] mx-auto px-6 lg:px-8 pt-10 lg:pt-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-navy/70 hover:text-teal transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Về trang chủ
        </Link>
      </div>

      {/* Hero */}
      <section
        aria-labelledby="blog-hero"
        className="max-w-[720px] mx-auto px-6 lg:px-8 pt-12 lg:pt-20 pb-12 lg:pb-16"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-8">
          <div className="flex-1">
            <h1
              id="blog-hero"
              className="font-display italic text-[36px] sm:text-[44px] lg:text-[48px] leading-[1.1] tracking-tighter text-navy"
            >
              Blog Lingona
            </h1>
            <p className="mt-6 font-sans text-lg leading-relaxed text-navy/70 max-w-[560px]">
              Mình viết về cách luyện IELTS hiệu quả hơn — không trung tâm,
              không tài liệu cũ, không lý thuyết suông.
            </p>
          </div>
          <div
            className="sm:flex-shrink-0 self-start sm:self-center"
            aria-hidden="true"
          >
            <Mascot size={72} mood="default" priority />
          </div>
        </div>
      </section>

      {/* Posts grid OR empty state */}
      <section
        aria-label="Danh sách bài viết"
        className="max-w-[960px] mx-auto px-6 lg:px-8 py-12 lg:py-16"
      >
        {posts.length === 0 ? (
          <div className="max-w-[560px] mx-auto text-center py-16">
            <p className="font-sans text-[17px] lg:text-[19px] leading-[1.7] text-navy/70">
              Mình đang viết bài đầu tiên. Quay lại sớm nhé.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 list-none p-0">
            {posts.map((p) => (
              <li key={p.slug}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Closing nav (no self-link) */}
      <section className="max-w-[720px] mx-auto px-6 lg:px-8 py-20 lg:py-24">
        <nav
          aria-label="Liên kết phụ"
          className="font-sans text-sm text-navy/70 flex justify-center items-center gap-3 flex-wrap"
        >
          <Link
            href="/"
            className="hover:text-teal transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded"
          >
            Trang chủ
          </Link>
          <span aria-hidden="true" className="text-navy/30">·</span>
          <Link
            href="/about"
            className="hover:text-teal transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded"
          >
            Về Lingona
          </Link>
          <span aria-hidden="true" className="text-navy/30">·</span>
          <Link
            href="/help"
            className="hover:text-teal transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded"
          >
            Trợ giúp
          </Link>
          <span aria-hidden="true" className="text-navy/30">·</span>
          <Link
            href="/legal"
            className="hover:text-teal transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded"
          >
            Pháp lý
          </Link>
        </nav>
      </section>
    </main>
  );
}
