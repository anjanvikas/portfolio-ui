import { adminApiGet, adminApiSend } from "@/lib/admin-proxy";

// GET /api/admin/experience — every entry in display order. POST — create one.
export async function GET() {
  return adminApiGet("/api/v1/admin/experience");
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid request body" }, { status: 400 });
  }
  return adminApiSend("POST", "/api/v1/admin/experience", body);
}
