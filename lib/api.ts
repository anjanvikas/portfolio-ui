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
