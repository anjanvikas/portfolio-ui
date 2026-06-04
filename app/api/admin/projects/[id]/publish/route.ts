import { adminApiSend } from "@/lib/admin-proxy";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/admin/projects/[id]/publish — set published_at (idempotent).
export async function POST(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return adminApiSend("POST", `/api/v1/admin/projects/${id}/publish`);
}
