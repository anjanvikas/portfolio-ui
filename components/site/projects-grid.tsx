"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { ProjectCard } from "@/lib/api";

// Cover-slab background cycle, matching the homepage featured strip:
// chartreuse → pink → paper. Cycling (not random) keeps the grid coherent.
const COVER_TINTS = ["bg-accent", "bg-accent-2", "bg-paper"] as const;

// Sentinel for the "show everything" filter chip.
const ALL = "All";

// Client-side filterable project grid. Receives the full published list from
// the server page and filters it in the browser when a tag chip is clicked —
// no navigation, no refetch (SCRUM-61 AC).
export function ProjectsGrid({ projects }: { projects: ProjectCard[] }) {
  const [activeTag, setActiveTag] = useState<string>(ALL);

  // Unique tag names across all projects, alphabetised, with "All" pinned first.
  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) for (const t of p.tags) set.add(t);
    return [ALL, ...[...set].sort((a, b) => a.localeCompare(b))];
  }, [projects]);

  const filtered = useMemo(
    () =>
      activeTag === ALL
        ? projects
        : projects.filter((p) => p.tags.includes(activeTag)),
    [projects, activeTag],
  );

  return (
    <>
      {tags.length > 1 && (
        <ul className="mt-8 flex flex-wrap gap-3 md:mt-10">
          {tags.map((tag) => {
            const active = tag === activeTag;
            return (
              <li key={tag}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveTag(tag)}
                  className={`border-2 border-ink px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wider transition-[transform,box-shadow,background-color] duration-100 ${
                    active
                      ? "bg-accent text-ink shadow-brut"
                      : "bg-paper text-ink hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut"
                  }`}
                >
                  {tag}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {filtered.length === 0 ? (
        <p className="mt-10 font-mono text-sm uppercase tracking-wider text-muted-brut">
          No projects tagged {activeTag}.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:mt-10 md:grid-cols-3">
          {filtered.map((project, i) => (
            <ProjectCardLink
              key={project.slug}
              project={project}
              tint={COVER_TINTS[i % COVER_TINTS.length]}
            />
          ))}
        </div>
      )}
    </>
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
