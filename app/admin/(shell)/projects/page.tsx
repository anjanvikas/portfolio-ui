"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import {
  ApiError,
  UNAUTHORIZED,
  type AdminProjectListItem,
  deleteProject,
  fetchAdminProjects,
} from "@/lib/admin-projects";
import { cn } from "@/lib/utils";

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<AdminProjectListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAdminProjects();
        if (!cancelled) setProjects(data);
      } catch (err) {
        if (err instanceof ApiError && err.message === UNAUTHORIZED) {
          router.replace("/admin/login");
          return;
        }
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteProject(id);
      setConfirmId(null);
      setProjects((prev) => prev?.filter((p) => p.id !== id) ?? null);
    } catch (err) {
      if (err instanceof ApiError && err.message === UNAUTHORIZED) {
        router.replace("/admin/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-brut">Content</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">Projects</h1>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 border-2 border-ink bg-accent px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide shadow-brut transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          New project
        </Link>
      </header>

      {error && (
        <p role="alert" className="mb-6 border-2 border-accent-2 bg-accent-2/10 px-4 py-3 font-mono text-sm">
          {error}
        </p>
      )}

      {projects === null && !error ? (
        <p className="font-mono text-sm text-muted-brut">Loading…</p>
      ) : projects && projects.length === 0 ? (
        <div className="border-2 border-dashed border-ink bg-paper-2 px-6 py-12 text-center">
          <p className="font-display text-lg font-bold">No projects yet</p>
          <p className="mt-1 font-mono text-sm text-muted-brut">Create your first project to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-ink shadow-brut">
          <table className="w-full border-collapse bg-paper text-left">
            <thead>
              <tr className="border-b-2 border-ink bg-paper-2 font-display text-xs uppercase tracking-wider">
                <th className="px-4 py-3 font-bold">Title</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Featured</th>
                <th className="px-4 py-3 font-bold">Published</th>
                <th className="px-4 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects?.map((project) => (
                <tr key={project.id} className="border-b border-ink/15 align-middle last:border-b-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="font-display font-semibold underline decoration-accent decoration-2 underline-offset-4 hover:decoration-accent-2"
                    >
                      {project.title}
                    </Link>
                    <span className="mt-0.5 block font-mono text-xs text-muted-brut">{project.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-4 py-3">
                    {project.featured ? (
                      <span className="inline-block border-2 border-ink bg-accent-2 px-2 py-0.5 font-display text-xs font-bold uppercase tracking-wide text-paper">
                        ★ Featured
                      </span>
                    ) : (
                      <span className="font-mono text-sm text-muted-brut">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm tabular-nums text-muted-brut">
                    {project.published_at ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {confirmId === project.id ? (
                        <>
                          <span className="font-mono text-xs text-muted-brut">Delete?</span>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            disabled={deletingId === project.id}
                            className="border-2 border-ink px-2.5 py-1 font-display text-xs font-bold uppercase hover:bg-paper-2"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(project.id)}
                            disabled={deletingId === project.id}
                            className="border-2 border-ink bg-accent-2 px-2.5 py-1 font-display text-xs font-bold uppercase text-paper hover:-translate-y-0.5"
                          >
                            {deletingId === project.id ? "…" : "Delete"}
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href={`/admin/projects/${project.id}`}
                            className="border-2 border-ink px-2.5 py-1 font-display text-xs font-bold uppercase hover:bg-paper-2"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setConfirmId(project.id)}
                            className="border-2 border-ink px-2.5 py-1 font-display text-xs font-bold uppercase text-accent-2 hover:bg-accent-2 hover:text-paper"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "draft" | "published" }) {
  return (
    <span
      className={cn(
        "inline-block border-2 border-ink px-2 py-0.5 font-display text-xs font-bold uppercase tracking-wide",
        status === "published" ? "bg-accent" : "bg-paper-2 text-muted-brut",
      )}
    >
      {status}
    </span>
  );
}
