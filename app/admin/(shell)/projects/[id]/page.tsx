"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ProjectEditor } from "@/components/admin/project-editor";
import {
  ApiError,
  UNAUTHORIZED,
  type AdminProject,
  fetchAdminProject,
} from "@/lib/admin-projects";

export default function EditProjectPage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const router = useRouter();
  const [project, setProject] = useState<AdminProject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await fetchAdminProject(id);
        if (!cancelled) setProject(p);
      } catch (err) {
        if (err instanceof ApiError && err.message === UNAUTHORIZED) {
          router.replace("/admin/login");
          return;
        }
        if (!cancelled) {
          setError(
            err instanceof ApiError && err.status === 404
              ? "This project no longer exists."
              : err instanceof Error
                ? err.message
                : "Failed to load project",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <p className="font-display text-xl font-bold">{error}</p>
        <Link
          href="/admin/projects"
          className="mt-4 inline-block border-2 border-ink bg-paper px-4 py-2 font-display text-sm font-bold uppercase shadow-brut"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return <p className="px-5 py-10 font-mono text-sm text-muted-brut md:px-8">Loading…</p>;
  }

  return <ProjectEditor initial={project} />;
}
