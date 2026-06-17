import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

import { MarkdownSection } from "@/components/site/markdown-section";
import { fetchProject, fetchProjects } from "@/lib/api";

// ISR: rebuild each detail page at most once per 60s (SCRUM-61 AC).
export const revalidate = 60;

// Pre-render a static page per published project at build time. Slugs added
// later are rendered on first request, then cached per `revalidate`.
export async function generateStaticParams() {
  const projects = await fetchProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/projects/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await fetchProject(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.title} — Anjan Vikas Reddy`,
    description: project.summary || project.tagline,
  };
}

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[slug]">,
) {
  const { slug } = await props.params;
  const project = await fetchProject(slug);
  if (!project) notFound();

  const hasCover =
    Boolean(project.cover_url) && !project.cover_url.includes("example.com");
  const year = project.published_at ? project.published_at.slice(0, 4) : null;

  // Overview falls back to the summary when the CMS section is empty
  // (wireframe rule). Why-built / learning render nothing when empty.
  const overviewBody =
    project.body_overview.trim() ||
    (project.summary ? `## Overview\n\n${project.summary}` : "");

  return (
    <article className="bg-paper">
      {/* Back strip */}
      <div className="mx-auto max-w-4xl px-5 pt-6 md:px-6 md:pt-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-muted-brut transition-colors hover:text-ink"
        >
          <ArrowLeft strokeWidth={2.5} className="h-4 w-4" />
          Back to projects
        </Link>
      </div>

      {/* Full-bleed cover band */}
      <div className="mt-6 md:mt-8">
        <div className="relative flex h-60 w-full items-center justify-center border-y-[3px] border-ink bg-accent md:h-[460px]">
          {hasCover ? (
            <Image
              src={project.cover_url}
              alt={project.title}
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
      <div className="mx-auto max-w-4xl px-5 pt-12 pb-8 md:px-6 md:pt-20 md:pb-12">
        <div className="mx-auto max-w-[720px]">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-accent-2">
            — Project
          </p>

          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] text-ink md:mt-5 md:text-6xl">
            {project.title.endsWith(".") ? project.title : `${project.title}.`}
          </h1>

          {project.tagline && (
            <p className="mt-5 font-body text-lg leading-relaxed text-muted-brut md:mt-6 md:text-xl">
              {project.tagline}
            </p>
          )}

          {year && (
            <p className="mt-6 font-mono text-xs font-bold uppercase tracking-wider text-ink">
              Year <span className="text-muted-brut">{year}</span>
            </p>
          )}

          {project.tags.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border-2 border-ink bg-paper-2 px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex w-full flex-col gap-3 md:mt-10 md:w-auto md:flex-row md:items-center md:gap-4">
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border-2 border-ink-fixed bg-accent px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-ink-fixed shadow-brut-fixed transition-[transform,box-shadow] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-fixed-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-fixed-press md:px-7"
              >
                View repo
                <ArrowRight strokeWidth={2.5} className="h-4 w-4" />
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border-2 border-ink bg-paper px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-ink shadow-brut transition-[transform,box-shadow,background-color] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-accent hover:text-ink-fixed hover:shadow-brut-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-press md:px-7"
              >
                Live demo
                <ArrowUpRight strokeWidth={2.5} className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Body sections — 720px reading column */}
      <div className="mx-auto max-w-4xl px-5 pb-16 md:px-6 md:pb-24">
        <div className="mx-auto max-w-[720px]">
          <MarkdownSection body={overviewBody} />
          <MarkdownSection body={project.body_why_built} />
          <MarkdownSection body={project.body_learning} />
        </div>
      </div>
    </article>
  );
}
