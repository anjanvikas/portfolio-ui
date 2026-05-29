// API helpers for the marketing site.
//
// Two base URLs:
// - serverAPIBase: used by Server Components / Route Handlers. Prefers
//   INTERNAL_API_URL so server-to-server traffic stays on the private network
//   in prod; falls back to NEXT_PUBLIC_API_URL for dev.
// - browserAPIBase: rendered into HTML so the browser can hit it directly
//   (e.g. <a href> for the CV download). Only ever uses NEXT_PUBLIC_API_URL.

export function serverAPIBase(): string {
  return (
    process.env.INTERNAL_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080"
  );
}

export function browserAPIBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
}

export type SocialLink = {
  name: string;
  url: string;
};

export type Profile = {
  name: string;
  headline: string;
  bio: string;
  location: string;
  email: string;
  avatar_url: string;
  resume_url: string;
  social_links: SocialLink[];
};

export async function fetchProfile(): Promise<Profile> {
  const res = await fetch(`${serverAPIBase()}/api/v1/profile`, {
    // SSG opt-in: snapshot at build time, served from the framework cache
    // afterwards. Revalidate by triggering a new build/deploy.
    cache: "force-cache",
  });
  if (!res.ok) {
    throw new Error(`fetchProfile: HTTP ${res.status}`);
  }
  return (await res.json()) as Profile;
}

export type ProjectCard = {
  slug: string;
  title: string;
  summary: string;
  // Empty until real asset hosting lands (SCRUM-16); the UI falls back to a
  // colored cover slab when this is absent.
  cover_url: string;
  tags: string[];
};

// Fetches the featured projects strip for the homepage. SSG at build time via
// force-cache, same as fetchProfile.
export async function fetchFeaturedProjects(limit = 3): Promise<ProjectCard[]> {
  const res = await fetch(
    `${serverAPIBase()}/api/v1/projects?featured=true&limit=${limit}`,
    { cache: "force-cache" },
  );
  if (!res.ok) {
    throw new Error(`fetchFeaturedProjects: HTTP ${res.status}`);
  }
  return (await res.json()) as ProjectCard[];
}

// Full project detail, including the three markdown body sections. Returned by
// GET /api/v1/projects/{slug}.
export type ProjectDetail = {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  body_overview: string;
  body_why_built: string;
  body_learning: string;
  // Empty until real asset hosting lands (SCRUM-16).
  cover_url: string;
  repo_url: string;
  live_url: string;
  // ISO date (YYYY-MM-DD) or "" when unpublished.
  published_at: string;
  tags: string[];
};

// ISR revalidation window (seconds) for the projects list + detail pages.
// SCRUM-61 AC: 60s. Pages also re-export this as `revalidate`.
const PROJECTS_REVALIDATE = 60;

// Fetches every published project card for the /projects index. ISR: the
// snapshot is rebuilt at most once per PROJECTS_REVALIDATE seconds.
export async function fetchProjects(limit = 24): Promise<ProjectCard[]> {
  const res = await fetch(`${serverAPIBase()}/api/v1/projects?limit=${limit}`, {
    next: { revalidate: PROJECTS_REVALIDATE },
  });
  if (!res.ok) {
    throw new Error(`fetchProjects: HTTP ${res.status}`);
  }
  return (await res.json()) as ProjectCard[];
}

// Fetches a single project by slug. Returns null on 404 so the page can call
// notFound() instead of throwing. ISR like fetchProjects.
export async function fetchProject(slug: string): Promise<ProjectDetail | null> {
  const res = await fetch(
    `${serverAPIBase()}/api/v1/projects/${encodeURIComponent(slug)}`,
    { next: { revalidate: PROJECTS_REVALIDATE } },
  );
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`fetchProject(${slug}): HTTP ${res.status}`);
  }
  return (await res.json()) as ProjectDetail;
}
