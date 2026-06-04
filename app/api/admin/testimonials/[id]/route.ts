import { adminApiGet, adminApiSend } from "@/lib/admin-proxy";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return adminApiGet(`/api/v1/admin/testimonials/${id}`);
}

export async function PUT(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid request body" }, { status: 400 });
  }
  return adminApiSend("PUT", `/api/v1/admin/testimonials/${id}`, body);
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return adminApiSend("DELETE", `/api/v1/admin/testimonials/${id}`);
}
