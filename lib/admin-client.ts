// Shared client helpers for the admin resource CRUD (SCRUM-68). All calls go to
// same-origin /api/admin/* route handlers, which attach the JWT cookie and
// proxy to the Go API. Mirrors the error shape lib/admin-posts.ts established.

// Field-level validation errors mirror the Go handler's {errors: {...}} shape.
export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors?: FieldErrors,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// UNAUTHORIZED is thrown (as the message) on a 401 so callers can bounce to login.
export const UNAUTHORIZED = "unauthorized";

async function asError(res: Response): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* no body */
  }
  const b = (body ?? {}) as { error?: string; errors?: FieldErrors };
  if (res.status === 401) return new ApiError(401, UNAUTHORIZED);
  return new ApiError(res.status, b.error ?? `HTTP ${res.status}`, b.errors);
}

export async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw await asError(res);
  return (await res.json()) as T;
}

export async function sendJSON<T>(
  method: "POST" | "PUT" | "PATCH",
  path: string,
  body: unknown,
): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await asError(res);
  return (await res.json()) as T;
}

export async function postJSON<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw await asError(res);
  return (await res.json()) as T;
}

export async function del(path: string): Promise<void> {
  const res = await fetch(path, { method: "DELETE" });
  if (!res.ok) throw await asError(res);
}
