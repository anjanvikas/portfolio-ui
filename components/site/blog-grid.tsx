"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import type { PostCard } from "@/lib/api";

// Sentinel for the "show everything" filter chip.
const ALL = "All";

// Client-side filterable blog index. The server page fetches every published
// post; filtering happens in the browser on chip click — no navigation, no
// refetch (mirrors the projects grid). Cards are 2-col on desktop, 1-col mobile.
export function BlogGrid({ posts }: { posts: PostCard[] }) {
  const [activeTag, setActiveTag] = useState<string>(ALL);

  // Tag chips with counts: { label, count }. "All" is pinned first with the
  // total post count; the rest are unique tags sorted alphabetically.
  const chips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of posts) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    const rest = [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, count]) => ({ label, count }));
    return [{ label: ALL, count: posts.length }, ...rest];
  }, [posts]);

  const filtered = useMemo(
    () =>
      activeTag === ALL
        ? posts
        : posts.filter((p) => p.tags.includes(activeTag)),
    [posts, activeTag],
  );

  return (
    <>
      {chips.length > 1 && (
        <ul className="mt-8 flex flex-wrap gap-3 md:mt-10">
          {chips.map(({ label, count }) => {
            const active = label === activeTag;
            return (
              <li key={label}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveTag(label)}
                  className={`border-2 border-ink px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-[transform,box-shadow,background-color] duration-100 ${
                    active
                      ? "bg-accent text-ink shadow-brut"
                      : "bg-paper text-ink hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut"
                  }`}
                >
                  {label} <span className="text-muted-brut">· {count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {filtered.length === 0 ? (
        <p className="mt-10 font-mono text-sm uppercase tracking-wider text-muted-brut">
          No posts tagged {activeTag} yet.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:mt-10 md:grid-cols-2">
          {filtered.map((post) => (
            <PostCardLink key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  );
}

function PostCardLink({ post }: { post: PostCard }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-3 border-2 border-ink bg-paper-2 p-5 shadow-brut transition-[transform,box-shadow] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-hover md:p-6"
    >
      {post.series && (
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-accent-2">
          ▬▬ Series · {post.series.name}
        </p>
      )}

      <h2 className="line-clamp-3 font-display text-xl font-bold leading-tight text-ink md:text-2xl">
        {post.title}
      </h2>

      <p className="font-mono text-xs font-bold uppercase tracking-wider text-muted-brut">
        {post.published_at} · {post.reading_time_mins} min read
      </p>

      {post.tags.length > 0 && (
        <ul className="mt-auto flex flex-wrap gap-2 pt-1">
          {post.tags.slice(0, 3).map((tag) => (
            <li
              key={tag}
              className="rounded-full border-2 border-ink bg-paper px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink"
            >
              {tag}
            </li>
          ))}
          {post.tags.length > 3 && (
            <li className="rounded-full border-2 border-ink bg-paper px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink">
              +{post.tags.length - 3}
            </li>
          )}
        </ul>
      )}
    </Link>
  );
}
