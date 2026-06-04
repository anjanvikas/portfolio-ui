import { adminApiSend } from "@/lib/admin-proxy";

// POST /api/admin/experience/reorder — body {ids:[...]} top-to-bottom; the API
// rewrites sort_order and returns the re-listed entries.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid request body" }, { status: 400 });
  }
  return adminApiSend("POST", "/api/v1/admin/experience/reorder", body);
}
