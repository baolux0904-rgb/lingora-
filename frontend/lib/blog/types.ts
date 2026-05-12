/**
 * Blog domain types. SSG only — no runtime fs reads, no client bundle.
 * Frontmatter mirrors what `.mdx` files must declare.
 */

export type BlogFrontmatter = {
  title: string;
  /** URL slug, kebab-case. Must match filename `{slug}.mdx`. */
  slug: string;
  /** 1–2 sentence summary. Used in PostCard + meta description. */
  excerpt: string;
  /** ISO 8601, e.g. "2026-05-11". */
  publishedAt: string;
  /** ISO 8601 if revised after publish. */
  updatedAt?: string;
  /** V1: always "Louis". Widen union when we add authors. */
  author: "Louis";
  /** SEO keywords for `<meta name="keywords">` + Article JSON-LD. */
  keywords: string[];
  /** Optional OG image override. Defaults to site OG. */
  ogImage?: string;
};

export type BlogPost = BlogFrontmatter & {
  /** Raw MDX body — present only in `getPostBySlug`, omitted in list queries. */
  content: string;
  /** Auto-computed minutes, Vietnamese 150 wpm. Floor 1. */
  readingTime: number;
};

export type BlogPostMeta = Omit<BlogPost, "content">;
