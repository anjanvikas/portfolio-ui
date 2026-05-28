// Next.js 16 renamed `middleware.ts` to `proxy.ts` (same runtime, same API).
// Gates the admin section: if the admin_token cookie is missing, redirect to
// the login page before the protected page renders. Token validity itself is
// enforced by the Go API on each data fetch — this is the optimistic
// edge-level guard called out in the Next.js authentication guide.

import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_COOKIE } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) {
    const loginURL = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginURL, 307);
  }
  return NextResponse.next();
}

export const config = {
  // Match every /admin route except /admin/login itself, so the login page
  // never bounces against its own guard.
  matcher: ["/admin", "/admin/((?!login).*)"],
};
