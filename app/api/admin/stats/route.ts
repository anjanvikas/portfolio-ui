import { adminApiGet } from "@/lib/admin-proxy";

// GET /api/admin/stats — same-origin proxy to the Go API's protected
// GET /api/v1/admin/stats, attaching the admin JWT from the httpOnly cookie.
// Powers the dashboard counts, fetched client-side from the admin shell.
export async function GET() {
  return adminApiGet("/api/v1/admin/stats");
}
