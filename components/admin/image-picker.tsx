"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { AssetUpload } from "@/components/admin/asset-upload";
import { ApiError, UNAUTHORIZED, type Asset, fetchAssets } from "@/lib/admin-assets";

// ImagePicker is the modal the editor opens to insert an image. It lists the
// uploaded image assets in a grid, lets the admin upload new ones inline, and
// calls onSelect(url) when one is clicked. The caller decides what to do with
// the URL (insert ![](url) into the body, or set it as the cover).
export function ImagePicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setError(null);
      try {
        const data = await fetchAssets();
        if (!cancelled) setAssets(data);
      } catch (err) {
        if (err instanceof ApiError && err.message === UNAUTHORIZED) {
          if (!cancelled) setError("Session expired — reload and sign in again.");
          return;
        }
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load assets");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const images = (assets ?? []).filter((a) => a.type.startsWith("image/"));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Insert image"
        className="relative flex max-h-[85vh] w-full max-w-3xl flex-col border-[3px] border-ink bg-paper shadow-brut-lg"
      >
        <header className="flex items-center justify-between border-b-[3px] border-ink bg-paper-2 px-5 py-3">
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">Insert image</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="border-2 border-ink p-1 hover:bg-paper"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </header>

        <div className="overflow-y-auto p-5">
          <AssetUpload
            onUploaded={(a) => setAssets((prev) => [a, ...(prev ?? []).filter((x) => x.id !== a.id)])}
            accept="image/*"
            className="mb-6"
          />

          {error && (
            <p role="alert" className="mb-4 border-2 border-accent-2 bg-accent-2/10 px-4 py-3 font-mono text-sm">
              {error}
            </p>
          )}

          {assets === null && !error ? (
            <p className="font-mono text-sm text-muted-brut">Loading…</p>
          ) : images.length === 0 ? (
            <p className="font-mono text-sm text-muted-brut">
              No images yet — upload one above to insert it.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {images.map((asset) => (
                <li key={asset.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(asset.url)}
                    title={`Insert ${asset.filename}`}
                    className="group block w-full border-2 border-ink bg-paper-2 transition-transform hover:-translate-y-0.5 hover:shadow-brut"
                  >
                    <span className="block aspect-square overflow-hidden">
                      <Image
                        src={asset.url}
                        alt={asset.filename}
                        width={160}
                        height={160}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <span className="block truncate border-t-2 border-ink px-2 py-1 text-left font-mono text-[11px] group-hover:bg-accent">
                      {asset.filename}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
