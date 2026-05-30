// Shared types + client helpers for the admin blog CRUD (SCRUM-66). All calls
// go to same-origin /api/admin/* route handlers, which attach the JWT cookie
// and proxy to the Go API.

export type PostStatus = "draft" | "published";

// One row of the admin posts table.
export type AdminPostListItem = {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  published_at: string | null;
  reading_time_mins: number;
  series: string | null;
};

// The full post the editor loads and gets back after a save.
export type AdminPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_url: string;
  series_id: string | null;
  series_order: number | null;
  tags: string[];
  status: PostStatus;
  published_at: string | null;
  reading_time_mins: number;
};

export type AdminSeries = {
  id: string;
  slug: string;
  name: string;
};

// The editor's outgoing payload (POST/PUT body).
export type PostInput = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_url: string;
  series_id: string | null;
  series_order: number | null;
  tags: string[];
};

// Field-level validation errors mirror the Go handler's {errors: {...}} shape.
export type FieldErrors = Partial<Record<keyof PostInput, string>>;

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

// unauthorized is thrown when a proxy returns 401 so callers can bounce to login.
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

export async function fetchAdminPosts(): Promise<AdminPostListItem[]> {
  const res = await fetch("/api/admin/posts", { cache: "no-store" });
  if (!res.ok) throw await asError(res);
  return (await res.json()) as AdminPostListItem[];
}

export async function fetchAdminPost(id: string): Promise<AdminPost> {
  const res = await fetch(`/api/admin/posts/${id}`, { cache: "no-store" });
  if (!res.ok) throw await asError(res);
  return (await res.json()) as AdminPost;
}

export async function fetchAdminSeries(): Promise<AdminSeries[]> {
  const res = await fetch("/api/admin/series", { cache: "no-store" });
  if (!res.ok) throw await asError(res);
  return (await res.json()) as AdminSeries[];
}

export async function fetchAdminTags(): Promise<string[]> {
  const res = await fetch("/api/admin/tags", { cache: "no-store" });
  if (!res.ok) throw await asError(res);
  return (await res.json()) as string[];
}

export async function createPost(input: PostInput): Promise<AdminPost> {
  const res = await fetch("/api/admin/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await asError(res);
  return (await res.json()) as AdminPost;
}

export async function updatePost(id: string, input: PostInput): Promise<AdminPost> {
  const res = await fetch(`/api/admin/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await asError(res);
  return (await res.json()) as AdminPost;
}

export async function publishPost(id: string): Promise<AdminPost> {
  const res = await fetch(`/api/admin/posts/${id}/publish`, { method: "POST" });
  if (!res.ok) throw await asError(res);
  return (await res.json()) as AdminPost;
}

export async function deletePost(id: string): Promise<void> {
  const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
  if (!res.ok) throw await asError(res);
}
