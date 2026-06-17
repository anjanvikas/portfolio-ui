import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { ProjectCard } from "@/lib/api";

// Cover-slab background cycle: chartreuse → pink → paper, in order. Cycling
// (not random) makes the strip read as one unit. See homepage wireframe §3.
const COVER_TINTS = ["bg-accent", "bg-accent-2", "bg-paper"] as const;

// Featured work strip. Sits on paper-2 (deliberate background flip from the
// hero) and renders up to 3 project cards. Renders nothing when there are no
// featured projects so the page doesn't show an empty section.
export function FeaturedWork({ projects }: { projects: ProjectCard[] }) {
  if (projects.length === 0) return null;

  return (
    <section className="bg-paper-2">
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-6 md:py-20">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-accent-2">
              — Featured work
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-ink md:text-4xl">
              Things I&rsquo;ve shipped.
            </h2>
          </div>
          <ViewAllButton className="mt-4 hidden md:mt-0 md:inline-flex" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:mt-10 md:grid-cols-3">
          {projects.slice(0, 3).map((project, i) => (
            <ProjectCardLink
              key={project.slug}
              project={project}
              tint={COVER_TINTS[i % COVER_TINTS.length]}
            />
          ))}
        </div>

        <ViewAllButton className="mt-8 flex w-full justify-center md:hidden" full />
      </div>
    </section>
  );
}

function ProjectCardLink({
  project,
  tint,
}: {
  project: ProjectCard;
  tint: string;
}) {
  const hasCover =
    Boolean(project.cover_url) && !project.cover_url.includes("example.com");

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col border-[3px] border-ink bg-paper shadow-brut transition-[transform,box-shadow] duration-100 hover:-translate-y-0.5 hover:shadow-brut-hover"
    >
      <div
        className={`relative flex aspect-[16/10] items-center justify-center border-b-[3px] border-ink md:aspect-[3/2] ${tint}`}
      >
        {hasCover ? (
          <Image
            src={project.cover_url}
            alt={project.title}
            fill
            sizes="(min-width: 768px) 360px, 100vw"
            className="object-cover"
          />
        ) : (
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink/60">
            [cover]
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {project.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border-2 border-ink bg-paper px-3 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
        <h3 className="font-display text-xl font-bold leading-tight text-ink">
          {project.title}
        </h3>
        <p className="line-clamp-2 font-body text-sm leading-relaxed text-muted-brut">
          {project.summary}
        </p>
      </div>
    </Link>
  );
}

function ViewAllButton({
  className = "",
  full = false,
}: {
  className?: string;
  full?: boolean;
}) {
  return (
    <Link
      href="/projects"
      className={`items-center justify-center gap-2 border-2 border-ink bg-paper px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-ink shadow-brut transition-[transform,box-shadow,background-color] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-accent hover:text-ink-fixed hover:shadow-brut-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-press ${className}`}
    >
      {full ? "View all projects" : "View all"}
      <ArrowRight strokeWidth={2.5} className="h-4 w-4" />
    </Link>
  );
}
