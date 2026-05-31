import { adminApiSend } from "@/lib/admin-proxy";

// POST /api/admin/assets/presign — ask the Go API for a presigned R2 PUT URL
// and the object's final public URL. The browser uploads directly to the
// returned URL (the Go server never carries the bytes).
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid request body" }, { status: 400 });
  }
  return adminApiSend("POST", "/api/v1/admin/assets/presign", body);
}
