import { adminApiSend } from "@/lib/admin-proxy";

// POST /api/admin/posts/[id]/publish — promote a draft to published.
export async function POST(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  return adminApiSend("POST", `/api/v1/admin/posts/${id}/publish`);
}
