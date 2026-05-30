import { adminApiGet, adminApiSend } from "@/lib/admin-proxy";

// GET /api/admin/posts — proxy to the Go API's protected list of all posts
// (drafts + published) for the admin table.
export async function GET() {
  return adminApiGet("/api/v1/admin/posts");
}

// POST /api/admin/posts — create a new draft post. The editor's JSON body is
// forwarded as-is; the upstream's 400 (validation) / 409 (slug taken) flow back.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid request body" }, { status: 400 });
  }
  return adminApiSend("POST", "/api/v1/admin/posts", body);
}
