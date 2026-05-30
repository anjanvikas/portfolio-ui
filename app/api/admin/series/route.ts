import { adminApiGet } from "@/lib/admin-proxy";

// GET /api/admin/series — every series for the editor's series selector.
export async function GET() {
  return adminApiGet("/api/v1/admin/series");
}
