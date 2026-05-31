import { adminApiSend } from "@/lib/admin-proxy";

type Ctx = { params: Promise<{ id: string }> };

// DELETE /api/admin/assets/[id] — soft-delete a registry row (204). The R2
// object is left in place.
export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return adminApiSend("DELETE", `/api/v1/admin/assets/${id}`);
}
