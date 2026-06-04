// Server-only BFF helper for the admin section.
//
// The admin JWT lives in an httpOnly cookie owned by Next.js (see lib/auth.ts),
// so client JavaScript can never read it — and in production Next.js (Vercel)
// and the Go API (Fly.io) sit on different domains, so the cookie would not be
// sent cross-origin anyway. Admin pages therefore fetch same-origin Route
// Handlers, which read the cookie here and forward the token to the Go API as
// an Authorization: Bearer header. This is the same pattern the login/logout
// routes already use.

import { cookies } from "next/headers";

import { ADMIN_COOKIE, apiBaseURL } from "@/lib/auth";

// adminApiGet forwards an authenticated GET to the Go API at `path`
// (e.g. "/api/v1/admin/stats"). Returns 401 when the session cookie is missing
// so the client can bounce to /admin/login; otherwise the upstream response is
// passed straight through (including a 401 from an expired/invalid token).
export async function adminApiGet(path: string): Promise<Response> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  return fetch(`${apiBaseURL()}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

// adminApiSend forwards an authenticated mutating request (POST/PUT/DELETE) to
// the Go API. `body`, when present, is JSON-encoded. Like adminApiGet it returns
// 401 when the session cookie is missing, and otherwise passes the upstream
// response straight through (status, body, and all) so the caller can react to
// the 400/404/409 the API raises.
export async function adminApiSend(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<Response> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${apiBaseURL()}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
}

// adminApiSendForm forwards an authenticated multipart POST (a FormData body) to
// the Go API — used by the docx→markdown converter, the one admin endpoint that
// takes a file upload rather than JSON. fetch sets the multipart Content-Type
// (with boundary) itself, so we only attach the Authorization header.
export async function adminApiSendForm(path: string, form: FormData): Promise<Response> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  return fetch(`${apiBaseURL()}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    cache: "no-store",
  });
}
