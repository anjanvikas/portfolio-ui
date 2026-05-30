"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

// Counts returned by GET /api/v1/admin/stats (proxied via /api/admin/stats).
type Stats = {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  total_projects: number;
};

// Card order leads with the two numbers an editor scans first (what's live,
// what's still a draft). The accent strip colour-codes them.
const CARDS: { key: keyof Stats; label: string; accent: string }[] = [
  { key: "published_posts", label: "Published posts", accent: "bg-accent" },
  { key: "draft_posts", label: "Drafts", accent: "bg-accent-2" },
  { key: "total_posts", label: "Total posts", accent: "bg-ink" },
  { key: "total_projects", label: "Projects", accent: "bg-ink" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Same-origin call; the BFF route attaches the JWT cookie as a Bearer
        // header. A 401 means the session is gone — bounce to login.
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Stats;
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-brut">
          Overview
        </p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
          Dashboard
        </h1>
      </header>

      {error ? (
        <p
          role="alert"
          className="border-2 border-accent-2 bg-accent-2/10 px-4 py-3 font-mono text-sm"
        >
          Couldn’t load stats: {error}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {CARDS.map((card) => (
            <div
              key={card.key}
              className="border-2 border-ink bg-paper shadow-brut"
            >
              <div className={cn("h-2 border-b-2 border-ink", card.accent)} />
              <div className="px-4 py-5">
                <p className="font-mono text-4xl font-bold tabular-nums md:text-5xl">
                  {stats ? stats[card.key] : "—"}
                </p>
                <p className="mt-2 font-display text-xs font-medium uppercase tracking-wider text-muted-brut">
                  {card.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
