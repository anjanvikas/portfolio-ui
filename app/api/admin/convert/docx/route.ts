import { adminApiSendForm } from "@/lib/admin-proxy";

// POST /api/admin/convert/docx — forward a multipart docx upload to the Go API,
// which runs pandoc and returns {markdown}. The file is never stored.
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "expected a multipart upload" }, { status: 400 });
  }
  return adminApiSendForm("/api/v1/admin/convert/docx", form);
}
