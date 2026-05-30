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

// ---------------------------------------------------------------------------
// Blog (F07 / SCRUM-62 + SCRUM-74)
// ---------------------------------------------------------------------------

// Compact series descriptor embedded on a post card / detail. Null when the
// post is standalone.
export type SeriesRef = {
  name: string;
  slug: string;
  order: number;
};

export type PostCard = {
  slug: string;
  title: string;
  excerpt: string;
  // Empty until real asset hosting lands (SCRUM-16); the UI falls back to a
  // colored cover slab when this is absent.
  cover_url: string;
  // ISO date (YYYY-MM-DD).
  published_at: string;
  reading_time_mins: number;
  tags: string[];
  series: SeriesRef | null;
};

// One sibling in the prev/next series navigation.
export type SeriesNav = {
  title: string;
  slug: string;
  series_order: number;
};

export type PostDetail = PostCard & {
  body: string;
  // Total published parts in the series (the "of Y"); 0 when standalone.
  series_part_count: number;
  prev: SeriesNav | null;
  next: SeriesNav | null;
};

// One published post within a series, as returned by GET /api/v1/series/{slug}.
export type SeriesPost = {
  title: string;
  slug: string;
  series_order: number;
  published_at: string;
};

export type SeriesDetail = {
  id: string;
  title: string;
  slug: string;
  description: string;
  post_count: number;
  posts: SeriesPost[];
};

// Same 60s ISR window as the projects pages (SCRUM-62 mirrors SCRUM-61).
const BLOG_REVALIDATE = 60;

// Fetches published post cards for the /blog index, newest first.
export async function fetchPosts(limit = 50): Promise<PostCard[]> {
  const res = await fetch(`${serverAPIBase()}/api/v1/posts?limit=${limit}`, {
    next: { revalidate: BLOG_REVALIDATE },
  });
  if (!res.ok) {
    throw new Error(`fetchPosts: HTTP ${res.status}`);
  }
  return (await res.json()) as PostCard[];
}

// Fetches a single post by slug. Returns null on 404 so the page can call
// notFound() instead of throwing.
export async function fetchPost(slug: string): Promise<PostDetail | null> {
  const res = await fetch(
    `${serverAPIBase()}/api/v1/posts/${encodeURIComponent(slug)}`,
    { next: { revalidate: BLOG_REVALIDATE } },
  );
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`fetchPost(${slug}): HTTP ${res.status}`);
  }
  return (await res.json()) as PostDetail;
}

// Fetches a series (meta + full ordered list of published posts) for the post
// page's series TOC strip. Returns null on 404.
export async function fetchSeries(slug: string): Promise<SeriesDetail | null> {
  const res = await fetch(
    `${serverAPIBase()}/api/v1/series/${encodeURIComponent(slug)}`,
    { next: { revalidate: BLOG_REVALIDATE } },
  );
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`fetchSeries(${slug}): HTTP ${res.status}`);
  }
  return (await res.json()) as SeriesDetail;
}

// ---------------------------------------------------------------------------
// About (F08 / SCRUM-63)
// ---------------------------------------------------------------------------

// One work-history entry on the /about timeline. `end_date` is null for a
// current role — the UI renders "Present".
export type Experience = {
  id: string;
  company: string;
  role: string;
  location: string;
  // ISO date (YYYY-MM-DD).
  start_date: string;
  // ISO date or null (null = current role).
  end_date: string | null;
  // Markdown.
  description: string;
};

export type Testimonial = {
  id: string;
  author_name: string;
  author_role: string;
  author_company: string;
  quote: string;
};

// The /about page is fully static (SCRUM-63 AC). Both fetches snapshot at build
// time via force-cache, same as the homepage profile fetch.

// Fetches the work-history timeline, in display order (newest first).
export async function fetchExperience(): Promise<Experience[]> {
  const res = await fetch(`${serverAPIBase()}/api/v1/experience`, {
    cache: "force-cache",
  });
  if (!res.ok) {
    throw new Error(`fetchExperience: HTTP ${res.status}`);
  }
  return (await res.json()) as Experience[];
}

// Fetches the testimonials strip, in display order.
export async function fetchTestimonials(): Promise<Testimonial[]> {
  const res = await fetch(`${serverAPIBase()}/api/v1/testimonials`, {
    cache: "force-cache",
  });
  if (!res.ok) {
    throw new Error(`fetchTestimonials: HTTP ${res.status}`);
  }
  return (await res.json()) as Testimonial[];
}
