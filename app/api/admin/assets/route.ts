import { adminApiGet, adminApiSend } from "@/lib/admin-proxy";

// GET /api/admin/assets — the asset registry (newest first) for the asset page
// table and the editor image picker.
export async function GET() {
  return adminApiGet("/api/v1/admin/assets");
}

// POST /api/admin/assets — register an object the browser already uploaded to
// R2. Body: {filename, url, type, size}. Upstream 400 (bad/foreign url) flows
// back.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid request body" }, { status: 400 });
  }
  return adminApiSend("POST", "/api/v1/admin/assets", body);
}
