import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog/posts";

const SITE = "https://lingona.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/help`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/legal`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE}/legal/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE}/legal/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE}/legal/refund`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE}/legal/cookie`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE}/legal/data`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const blogRoutes: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
    url: `${SITE}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt ?? p.publishedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes];
}
