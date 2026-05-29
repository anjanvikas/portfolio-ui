import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { PostBody, extractHeadings } from "@/components/site/post-body";
import { PostToc } from "@/components/site/post-toc";
import { SeriesStrip } from "@/components/site/series-strip";
import { fetchPost, fetchPosts, fetchSeries } from "@/lib/api";

// ISR: rebuild each post at most once per 60s (SCRUM-62).
export const revalidate = 60;

// Pre-render a static page per published post at build time.
export async function generateStaticParams() {
  const posts = await fetchPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await fetchPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.title} — Anjan Vikas Reddy`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = await fetchPost(slug);
  if (!post) notFound();

  // Series TOC strip needs the full ordered list of published parts.
  const series = post.series ? await fetchSeries(post.series.slug) : null;
  const headings = extractHeadings(post.body);
  const hasCover =
    Boolean(post.cover_url) && !post.cover_url.includes("example.com");

  return (
    <article id="top" className="bg-paper">
      {/* Back strip */}
      <div className="mx-auto max-w-6xl px-5 pt-6 md:px-6 md:pt-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-muted-brut transition-colors hover:text-ink"
        >
          <ArrowLeft strokeWidth={2.5} className="h-4 w-4" />
          Back to blog
        </Link>
      </div>

      {/* Series TOC strip (only for posts in a series) */}
      {series && post.series && (
        <div className="mt-6 md:mt-8">
          <SeriesStrip
            series={series}
            currentSlug={post.slug}
            currentOrder={post.series.order}
          />
        </div>
      )}

      {/* Full-bleed cover band */}
      <div className={series ? "" : "mt-6 md:mt-8"}>
        <div className="relative flex h-60 w-full items-center justify-center border-y-[3px] border-ink bg-accent md:h-[480px]">
          {hasCover ? (
            <Image
              src={post.cover_url}
              alt={post.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          ) : (
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink/50">
              [cover]
            </span>
          )}
        </div>
      </div>

      {/* Header block — 720px reading column */}
      <div className="mx-auto max-w-6xl px-5 pt-10 pb-6 md:px-6 md:pt-16 md:pb-8">
        <div className="mx-auto max-w-[720px]">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-accent-2">
            — Post
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] text-ink md:mt-5 md:text-6xl">
            {post.title.endsWith(".") ? post.title : `${post.title}.`}
          </h1>
          <p className="mt-5 font-mono text-xs font-bold uppercase tracking-wider text-muted-brut md:mt-6">
            {post.published_at} · {post.reading_time_mins} min read
            <span className="hidden md:inline"> · by Anjan Vikas Reddy</span>
          </p>
          {post.tags.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border-2 border-ink bg-paper-2 px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Body + sticky TOC */}
      <div className="mx-auto flex max-w-6xl gap-10 px-5 pb-16 md:px-6 md:pb-24">
        <div className="mx-auto w-full max-w-[720px]">
          <PostBody body={post.body} />
        </div>
        <PostToc headings={headings} />
      </div>

      {/* Prev / next series nav (only for posts in a series) */}
      {post.series && (post.prev || post.next) && (
        <div className="mx-auto max-w-6xl px-5 pb-16 md:px-6 md:pb-24">
          <div className="mx-auto grid max-w-[720px] grid-cols-1 gap-4 md:grid-cols-2">
            {post.prev ? (
              <Link
                href={`/blog/${post.prev.slug}`}
                className="group flex flex-col gap-1 border-2 border-ink bg-paper-2 p-5 transition-colors duration-100 hover:bg-accent-2"
              >
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-brut group-hover:text-ink">
                  <ArrowLeft strokeWidth={2.5} className="h-3.5 w-3.5" />
                  Part {post.prev.series_order}
                </span>
                <span className="font-display text-base font-bold leading-tight text-ink">
                  {post.prev.title}
                </span>
              </Link>
            ) : (
              <span className="hidden md:block" />
            )}
            {post.next && (
              <Link
                href={`/blog/${post.next.slug}`}
                className="group flex flex-col items-end gap-1 border-2 border-ink bg-paper-2 p-5 text-right transition-colors duration-100 hover:bg-accent-2"
              >
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-muted-brut group-hover:text-ink">
                  Part {post.next.series_order}
                  <ArrowRight strokeWidth={2.5} className="h-3.5 w-3.5" />
                </span>
                <span className="font-display text-base font-bold leading-tight text-ink">
                  {post.next.title}
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
