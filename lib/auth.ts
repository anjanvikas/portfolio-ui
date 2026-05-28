// Shared auth-cookie constants for the admin session.
// The cookie is owned by the Next.js app, not the Go API — Next.js and the API
// live on different domains in production (Vercel + Fly.io), so the API
// returns the JWT in a JSON body and the Next.js route handlers attach it as
// an httpOnly cookie scoped to the frontend domain. The proxy reads this
// cookie to gate /admin/*.

export const ADMIN_COOKIE = "admin_token";

// 7 days, matching the JWT lifetime issued by the Go API.
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function apiBaseURL(): string {
  return (
    process.env.INTERNAL_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080"
  );
}
