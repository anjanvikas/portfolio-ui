import { adminApiGet, adminApiSend } from "@/lib/admin-proxy";

// GET /api/admin/profile — the singleton profile. PUT — save edits.
export async function GET() {
  return adminApiGet("/api/v1/admin/profile");
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid request body" }, { status: 400 });
  }
  return adminApiSend("PUT", "/api/v1/admin/profile", body);
}
