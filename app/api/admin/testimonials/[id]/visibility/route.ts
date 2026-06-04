import { adminApiSend } from "@/lib/admin-proxy";

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/testimonials/[id]/visibility — body {visible:bool}.
export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid request body" }, { status: 400 });
  }
  return adminApiSend("PATCH", `/api/v1/admin/testimonials/${id}/visibility`, body);
}
