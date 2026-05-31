"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, Copy, FileText } from "lucide-react";

import { AssetUpload } from "@/components/admin/asset-upload";
import {
  ApiError,
  UNAUTHORIZED,
  type Asset,
  deleteAsset,
  fetchAssets,
  formatBytes,
} from "@/lib/admin-assets";

export default function AdminAssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function onUnauthorized(err: unknown): boolean {
    if (err instanceof ApiError && err.message === UNAUTHORIZED) {
      router.replace("/admin/login");
      return true;
    }
    return false;
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAssets();
        if (!cancelled) setAssets(data);
      } catch (err) {
        if (onUnauthorized(err)) return;
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  function onUploaded(asset: Asset) {
    // Prepend; replace any existing row with the same id (re-upload upserts).
    setAssets((prev) => [asset, ...(prev ?? []).filter((a) => a.id !== asset.id)]);
  }

  async function copyUrl(asset: Asset) {
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopiedId(asset.id);
      setTimeout(() => setCopiedId((c) => (c === asset.id ? null : c)), 1500);
    } catch {
      setError("Could not copy to clipboard");
    }
  }

  async function onDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteAsset(id);
      setConfirmId(null);
      setAssets((prev) => prev?.filter((a) => a.id !== id) ?? null);
    } catch (err) {
      if (onUnauthorized(err)) return;
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-brut">Media</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
          Assets
        </h1>
      </header>

      <AssetUpload onUploaded={onUploaded} accept="image/*" className="mb-8" />

      {error && (
        <p
          role="alert"
          className="mb-6 border-2 border-accent-2 bg-accent-2/10 px-4 py-3 font-mono text-sm"
        >
          {error}
        </p>
      )}

      {assets === null && !error ? (
        <p className="font-mono text-sm text-muted-brut">Loading…</p>
      ) : assets && assets.length === 0 ? (
        <div className="border-2 border-dashed border-ink bg-paper-2 px-6 py-12 text-center">
          <p className="font-display text-lg font-bold">No assets yet</p>
          <p className="mt-1 font-mono text-sm text-muted-brut">
            Upload an image above to populate the library.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border-2 border-ink shadow-brut">
          <table className="w-full border-collapse bg-paper text-left">
            <thead>
              <tr className="border-b-2 border-ink bg-paper-2 font-display text-xs uppercase tracking-wider">
                <th className="px-4 py-3 font-bold">Preview</th>
                <th className="px-4 py-3 font-bold">Filename</th>
                <th className="px-4 py-3 font-bold">Type</th>
                <th className="px-4 py-3 font-bold">Size</th>
                <th className="px-4 py-3 font-bold">Uploaded</th>
                <th className="px-4 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assets?.map((asset) => (
                <tr key={asset.id} className="border-b border-ink/15 align-middle last:border-b-0">
                  <td className="px-4 py-2">
                    <Thumb asset={asset} />
                  </td>
                  <td className="max-w-[16rem] px-4 py-3">
                    <span className="block truncate font-display font-semibold">{asset.filename}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-brut">{asset.type || "—"}</td>
                  <td className="px-4 py-3 font-mono text-sm tabular-nums text-muted-brut">
                    {formatBytes(asset.size)}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm tabular-nums text-muted-brut">
                    {asset.created_at ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {confirmId === asset.id ? (
                        <>
                          <span className="font-mono text-xs text-muted-brut">Delete?</span>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            disabled={deletingId === asset.id}
                            className="border-2 border-ink px-2.5 py-1 font-display text-xs font-bold uppercase hover:bg-paper-2"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(asset.id)}
                            disabled={deletingId === asset.id}
                            className="border-2 border-ink bg-accent-2 px-2.5 py-1 font-display text-xs font-bold uppercase text-paper hover:-translate-y-0.5"
                          >
                            {deletingId === asset.id ? "…" : "Delete"}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => copyUrl(asset)}
                            className="inline-flex items-center gap-1.5 border-2 border-ink px-2.5 py-1 font-display text-xs font-bold uppercase hover:bg-paper-2"
                          >
                            {copiedId === asset.id ? (
                              <>
                                <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" strokeWidth={2.5} /> URL
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(asset.id)}
                            className="border-2 border-ink px-2.5 py-1 font-display text-xs font-bold uppercase text-accent-2 hover:bg-accent-2 hover:text-paper"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Thumb shows a small image preview for image assets, or a file glyph otherwise.
// unoptimized: the loader points at the R2 public host directly (these are
// admin-only thumbnails — not worth a Next image-optimization round-trip).
function Thumb({ asset }: { asset: Asset }) {
  if (asset.type.startsWith("image/")) {
    return (
      <span className="block h-12 w-12 overflow-hidden border-2 border-ink bg-paper-2">
        <Image
          src={asset.url}
          alt={asset.filename}
          width={48}
          height={48}
          unoptimized
          className="h-full w-full object-cover"
        />
      </span>
    );
  }
  return (
    <span className="flex h-12 w-12 items-center justify-center border-2 border-ink bg-paper-2">
      <FileText className="h-5 w-5 text-muted-brut" />
    </span>
  );
}
