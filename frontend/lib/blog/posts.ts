import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { BlogFrontmatter, BlogPost, BlogPostMeta } from "./types";
import { readingTime } from "./reading-time";

/**
 * Build-time file-system loader for MDX blog posts.
 *
 * Posts live at `frontend/content/blog/{slug}.mdx`. Filename must match
 * the `slug` field in frontmatter. Both Next.js SSG (generateStaticParams)
 * and RSC page components call into here at build time only — no runtime
 * fs access ships to the client.
 */

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

function readAllRaw(): { slug: string; raw: string }[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => ({
      slug: f.replace(/\.mdx$/, ""),
      raw: fs.readFileSync(path.join(POSTS_DIR, f), "utf8"),
    }));
}

function parsePost(slug: string, raw: string): BlogPost {
  const { data, content } = matter(raw);
  const fm = data as BlogFrontmatter;
  if (fm.slug !== slug) {
    throw new Error(
      `[blog] frontmatter.slug "${fm.slug}" does not match filename "${slug}.mdx"`
    );
  }
  return {
    ...fm,
    content,
    readingTime: readingTime(content),
  };
}

export function getAllPosts(): BlogPostMeta[] {
  return readAllRaw()
    .map(({ slug, raw }) => parsePost(slug, raw))
    .map(({ content: _content, ...meta }) => meta)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  return parsePost(slug, raw);
}

export function getAllSlugs(): string[] {
  return readAllRaw().map(({ slug }) => slug);
}
