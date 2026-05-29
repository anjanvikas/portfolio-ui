import type { Metadata } from "next";

import { BlogGrid } from "@/components/site/blog-grid";
import { fetchPosts } from "@/lib/api";

// ISR: rebuild this page at most once per 60s (SCRUM-62, mirrors projects).
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog — Anjan Vikas Reddy",
  description:
    "Series and one-offs. Mostly Go, Postgres, and the things I learn the hard way.",
};

export default async function BlogPage() {
  const posts = await fetchPosts();

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-5 pt-10 pb-16 md:px-6 md:pt-16 md:pb-24">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-accent-2">
          — Writing
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink md:text-6xl">
          Notes from the build.
        </h1>
        <p className="mt-5 max-w-2xl font-body text-base leading-relaxed text-muted-brut md:text-lg">
          Series and one-offs. Mostly Go, Postgres, and the things I learn the
          hard way.
        </p>

        <BlogGrid posts={posts} />
      </div>
    </section>
  );
}
