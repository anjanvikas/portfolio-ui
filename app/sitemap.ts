import type { MetadataRoute } from "next";

import { fetchPosts, fetchProjects } from "@/lib/api";

// Rebuild the sitemap on the same 60s ISR cadence as the blog/projects pages —
// new content shows up within the same window.
export const revalidate = 60;

const siteURL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetches use the same SSG-friendly cache the rest of the app uses; failures
  // shouldn't take the sitemap down, so we degrade to the static pages.
  const [posts, projects] = await Promise.all([
    fetchPosts(100).catch(() => []),
    fetchProjects(100).catch(() => []),
  ]);

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${siteURL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteURL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteURL}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteURL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteURL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  const projectEntries: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${siteURL}/projects/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${siteURL}/blog/${p.slug}`,
    lastModified: p.published_at ? new Date(p.published_at) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...projectEntries, ...postEntries];
}
