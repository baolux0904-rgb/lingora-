import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Mascot from "@/components/ui/Mascot";
import Callout from "@/components/blog/Callout";
import BandComparison from "@/components/blog/BandComparison";
import CtaToLingona from "@/components/blog/CtaToLingona";
import { getAllSlugs, getPostBySlug } from "@/lib/blog/posts";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

interface PageProps {
  params: { slug: string };
}

function formatVnDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export async function generateMetadata({ params }: PageProps) {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Không tìm thấy bài viết — Blog Lingona" };

  const url = `https://lingona.app/blog/${post.slug}`;
  return {
    title: `${post.title} — Blog Lingona`,
    description: post.excerpt,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: ["Louis Nguyen"],
      url,
      siteName: "Lingona",
      locale: "vi_VN",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

const mdxComponents = {
  Callout,
  BandComparison,
  CtaToLingona,
};

const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  },
};

export default function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const url = `https://lingona.app/blog/${post.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      "@type": "Person",
      name: "Louis Nguyen",
      url: "https://lingona.app",
    },
    publisher: {
      "@type": "Organization",
      name: "Lingona",
      url: "https://lingona.app",
    },
    mainEntityOfPage: url,
    keywords: post.keywords.join(", "),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: "https://lingona.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://lingona.app/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: url,
      },
    ],
  };

  return (
    <main className="bg-cream min-h-screen text-navy">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="max-w-[720px] mx-auto px-6 lg:px-8 pt-10 lg:pt-14">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-navy/70 hover:text-teal transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Blog
        </Link>
      </div>

      {/* Article header */}
      <header className="max-w-[720px] mx-auto px-6 lg:px-8 pt-10 lg:pt-16 pb-6">
        <nav
          aria-label="Breadcrumb"
          className="font-sans text-[13px] lg:text-[14px] text-navy/50 mb-6"
        >
          <ol className="flex items-center gap-2 flex-wrap list-none p-0">
            <li>
              <Link href="/" className="hover:text-teal transition-colors duration-150">
                Trang chủ
              </Link>
            </li>
            <li aria-hidden="true" className="text-navy/30">/</li>
            <li>
              <Link href="/blog" className="hover:text-teal transition-colors duration-150">
                Blog
              </Link>
            </li>
            <li aria-hidden="true" className="text-navy/30">/</li>
            <li aria-current="page" className="truncate max-w-[240px]">
              {post.title}
            </li>
          </ol>
        </nav>

        <h1 className="font-display italic text-[32px] sm:text-[38px] lg:text-[44px] leading-[1.15] tracking-tighter text-navy">
          {post.title}
        </h1>

        <p className="mt-5 font-sans text-[14px] lg:text-[15px] text-navy/50 tabular-nums">
          {formatVnDate(post.publishedAt)} · {post.readingTime} phút đọc · —
          Louis
        </p>

        <p className="mt-6 font-display italic text-[18px] lg:text-[20px] leading-[1.5] text-navy/75 max-w-[600px]">
          {post.excerpt}
        </p>
      </header>

      {/* Article body — long-form reading scale, per
          .claude/skills/lingona-design/01-foundations/long-form-reading.md */}
      <article
        className="max-w-[720px] mx-auto px-6 lg:px-8 py-8 lg:py-12 font-sans text-navy/85
          text-[17px] lg:text-[18px] leading-[1.75]
          [&>p]:mb-6
          [&>h2]:font-display [&>h2]:italic [&>h2]:text-navy [&>h2]:text-[28px] [&>h2]:lg:text-[32px] [&>h2]:leading-[1.2] [&>h2]:tracking-tighter [&>h2]:mt-12 [&>h2]:mb-4
          [&>h3]:font-display [&>h3]:italic [&>h3]:text-navy [&>h3]:text-[22px] [&>h3]:lg:text-[24px] [&>h3]:leading-[1.25] [&>h3]:tracking-tight [&>h3]:mt-8 [&>h3]:mb-3
          [&>blockquote]:border-l-4 [&>blockquote]:border-navy/10 [&>blockquote]:pl-6 [&>blockquote]:my-8 [&>blockquote]:italic [&>blockquote]:text-navy/70
          [&_code]:bg-navy/5 [&_code]:text-navy [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.9em] [&_code]:font-mono
          [&>pre]:bg-navy [&>pre]:text-cream [&>pre]:rounded-lg [&>pre]:p-4 [&>pre]:my-6 [&>pre]:overflow-x-auto [&>pre_code]:bg-transparent [&>pre_code]:text-cream [&>pre_code]:p-0
          [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:my-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:my-4 [&>ul>li]:mb-2 [&>ol>li]:mb-2
          [&_a]:text-teal [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-navy
          [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse
          [&_th]:border [&_th]:border-navy/10 [&_th]:p-3 [&_th]:text-left [&_th]:bg-cream-warm [&_th]:font-semibold
          [&_td]:border [&_td]:border-navy/10 [&_td]:p-3
          [&_img]:rounded-lg [&_img]:my-8 [&_img]:w-full
          [&_figure>figcaption]:font-sans [&_figure>figcaption]:text-[14px] [&_figure>figcaption]:text-navy/50 [&_figure>figcaption]:text-center [&_figure>figcaption]:mt-3"
      >
        <MDXRemote
          source={post.content}
          components={mdxComponents}
          options={mdxOptions}
        />
      </article>

      {/* Author signature */}
      <section className="max-w-[720px] mx-auto px-6 lg:px-8 py-12 flex items-center gap-5 border-t border-navy/10 mt-8">
        <Mascot size={64} mood="happy" />
        <p className="font-sans text-[16px] lg:text-[17px] text-navy/80 m-0">
          <span className="font-display italic">— Louis</span>, founder Lingona
        </p>
      </section>

      {/* End-of-post CTA */}
      <section className="max-w-[560px] mx-auto px-6 lg:px-8 py-16 lg:py-20 text-center">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 font-sans text-[16px] lg:text-[17px] text-navy hover:text-teal transition-colors duration-150 underline underline-offset-4 decoration-navy/30 hover:decoration-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded"
        >
          Thử Lingona miễn phí
          <span aria-hidden="true" className="text-teal">→</span>
        </Link>
      </section>

      {/* Closing nav */}
      <section className="max-w-[720px] mx-auto px-6 lg:px-8 pb-20 lg:pb-24">
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
            href="/blog"
            className="hover:text-teal transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 rounded"
          >
            Blog
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
        </nav>
      </section>
    </main>
  );
}
