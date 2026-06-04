import { adminApiGet, adminApiSend } from "@/lib/admin-proxy";

// GET /api/admin/projects — list every project (drafts + published) for the
// admin table. POST — create a new draft project.
export async function GET() {
  return adminApiGet("/api/v1/admin/projects");
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid request body" }, { status: 400 });
  }
  return adminApiSend("POST", "/api/v1/admin/projects", body);
}
