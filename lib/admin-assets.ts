// Client helpers for the admin asset pipeline (SCRUM-67). Presign and register
// go through same-origin /api/admin/* route handlers (which attach the JWT
// cookie and proxy to the Go API); the actual file bytes are PUT straight to R2
// using the presigned URL, never touching our servers.

import { ApiError, UNAUTHORIZED, type FieldErrors } from "@/lib/admin-posts";

export type Asset = {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  width: number | null;
  height: number | null;
  created_at: string | null;
};

type PresignResult = {
  upload_url: string;
  public_url: string;
  key: string;
};

async function asError(res: Response): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* no body */
  }
  const b = (body ?? {}) as { error?: string; errors?: FieldErrors };
  if (res.status === 401) return new ApiError(401, UNAUTHORIZED);
  return new ApiError(res.status, b.error ?? `HTTP ${res.status}`, b.errors);
}

export async function fetchAssets(): Promise<Asset[]> {
  const res = await fetch("/api/admin/assets", { cache: "no-store" });
  if (!res.ok) throw await asError(res);
  return (await res.json()) as Asset[];
}

export async function deleteAsset(id: string): Promise<void> {
  const res = await fetch(`/api/admin/assets/${id}`, { method: "DELETE" });
  if (!res.ok) throw await asError(res);
}

async function presign(filename: string, contentType: string): Promise<PresignResult> {
  const res = await fetch("/api/admin/assets/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, content_type: contentType }),
  });
  if (!res.ok) throw await asError(res);
  return (await res.json()) as PresignResult;
}

// putToR2 uploads the file bytes directly to the presigned URL, reporting
// progress 0..1. Uses XMLHttpRequest because fetch has no upload-progress
// events. A non-2xx response (e.g. an R2 CORS or expiry failure) rejects.
function putToR2(uploadURL: string, file: File, onProgress?: (fraction: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadURL);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new ApiError(xhr.status, `upload failed (R2 returned ${xhr.status})`));
    };
    xhr.onerror = () =>
      reject(new ApiError(0, "upload failed — the bucket may not allow uploads from this origin (CORS)"));
    xhr.send(file);
  });
}

async function register(input: {
  filename: string;
  url: string;
  type: string;
  size: number;
  width?: number;
  height?: number;
}): Promise<Asset> {
  const res = await fetch("/api/admin/assets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await asError(res);
  return (await res.json()) as Asset;
}

// imageDimensions reads natural width/height for an image file (best effort;
// resolves nulls for non-images or a decode failure).
function imageDimensions(file: File): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith("image/")) return Promise.resolve({});
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({});
    };
    img.src = url;
  });
}

// uploadAsset runs the full pipeline for one file: presign → direct R2 PUT →
// register, returning the stored Asset. onProgress reports the upload fraction.
export async function uploadAsset(file: File, onProgress?: (fraction: number) => void): Promise<Asset> {
  const { upload_url, public_url } = await presign(file.name, file.type || "application/octet-stream");
  await putToR2(upload_url, file, onProgress);
  const { width, height } = await imageDimensions(file);
  return register({
    filename: file.name,
    url: public_url,
    type: file.type || "application/octet-stream",
    size: file.size,
    width,
    height,
  });
}

// convertDocx sends a .docx file to the converter and returns the markdown.
export async function convertDocx(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/convert/docx", { method: "POST", body: form });
  if (!res.ok) throw await asError(res);
  const body = (await res.json()) as { markdown: string };
  return body.markdown;
}

// formatBytes renders a byte count as a compact human string for the table.
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
}

export { ApiError, UNAUTHORIZED };
