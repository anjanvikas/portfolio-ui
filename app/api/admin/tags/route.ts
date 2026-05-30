import { adminApiGet } from "@/lib/admin-proxy";

// GET /api/admin/tags — all existing tag names for the editor's autocomplete.
export async function GET() {
  return adminApiGet("/api/v1/admin/tags");
}
