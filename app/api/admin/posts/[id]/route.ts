import { adminApiGet, adminApiSend } from "@/lib/admin-proxy";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/posts/[id] — load a single post (draft or published) into the
// editor.
export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return adminApiGet(`/api/v1/admin/posts/${id}`);
}

// PUT /api/admin/posts/[id] — save edits. Never changes publish state upstream.
export async function PUT(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid request body" }, { status: 400 });
  }
  return adminApiSend("PUT", `/api/v1/admin/posts/${id}`, body);
}

// DELETE /api/admin/posts/[id] — hard delete (204 on success, 404 if gone).
export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return adminApiSend("DELETE", `/api/v1/admin/posts/${id}`);
}
