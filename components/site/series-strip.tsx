"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";

import type { SeriesDetail } from "@/lib/api";

// Top-of-post series navigation: lists every published part with its date, marks
// the current part, and links the rest. Expanded by default on desktop (front-
// loads series context); collapsed to a one-liner on mobile to save vertical
// space. Note: the API exposes only published posts, so unpublished/"upcoming"
// parts don't appear (drafts aren't public) — a deliberate MVP simplification.
export function SeriesStrip({
  series,
  currentSlug,
  currentOrder,
}: {
  series: SeriesDetail;
  currentSlug: string;
  currentOrder: number;
}) {
  const [open, setOpen] = useState(false);

  const heading = `${series.title} · Part ${currentOrder} of ${series.post_count}`;

  return (
    <div className="border-y-2 border-ink-fixed bg-accent-2">
      <div className="mx-auto max-w-4xl px-5 py-4 md:px-8 md:py-6">
        {/* One-liner header. On mobile it's a tap target that expands the list. */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 text-left md:cursor-default"
        >
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink-fixed md:text-sm">
            {heading}
          </span>
          <ChevronDown
            strokeWidth={2.5}
            className={`h-4 w-4 shrink-0 text-ink-fixed transition-transform md:hidden ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </button>

        {/* Part list: always shown on desktop, toggled on mobile. */}
        <ol
          className={`mt-4 space-y-1 ${open ? "block" : "hidden"} md:block`}
        >
          {series.posts.map((post) => {
            const isCurrent = post.slug === currentSlug;
            const label = `${post.series_order}. ${post.title}`;

            if (isCurrent) {
              return (
                <li
                  key={post.slug}
                  className="flex items-center justify-between gap-3 border-l-[3px] border-ink-fixed bg-accent px-3 py-1.5"
                >
                  <span className="font-mono text-xs font-bold text-ink-fixed md:text-sm">
                    {label}{" "}
                    <span className="text-muted-brut-fixed">← (you)</span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-ink-fixed/70">
                    {post.published_at}
                  </span>
                </li>
              );
            }

            return (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex items-center justify-between gap-3 px-3 py-1.5 transition-colors hover:bg-ink-fixed/5"
                >
                  <span className="flex items-center gap-1.5 font-mono text-xs text-ink-fixed md:text-sm">
                    <Check strokeWidth={3} className="h-3.5 w-3.5 text-ink-fixed" aria-hidden />
                    {label}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-ink-fixed/70">
                    {post.published_at}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
