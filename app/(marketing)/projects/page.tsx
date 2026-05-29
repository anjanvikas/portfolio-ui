import type { Metadata } from "next";

import { ProjectsGrid } from "@/components/site/projects-grid";
import { fetchProjects } from "@/lib/api";

// ISR: rebuild this page at most once per 60s (SCRUM-61 AC).
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects — Anjan Vikas Reddy",
  description:
    "Things I've shipped — developer tools, backend systems, and experiments.",
};

export default async function ProjectsPage() {
  const projects = await fetchProjects();

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-5 pt-10 pb-16 md:px-6 md:pt-16 md:pb-24">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-accent-2">
          — Projects
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink md:text-6xl">
          Everything I&rsquo;ve built.
        </h1>
        <p className="mt-5 max-w-2xl font-body text-base leading-relaxed text-muted-brut md:text-lg">
          A working log of the things I&rsquo;ve shipped — pick a tag to narrow
          it down.
        </p>

        <ProjectsGrid projects={projects} />
      </div>
    </section>
  );
}
