"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { AssetUpload } from "@/components/admin/asset-upload";
import { ApiError, UNAUTHORIZED, type Asset, fetchAssets } from "@/lib/admin-assets";

// ImagePicker is the modal the editor opens to insert an image. It lists the
// uploaded image assets in a grid, lets the admin upload new ones inline, and
// calls onSelect(url, alt) when one is chosen. The caller decides what to do
// with the URL (insert ![alt](url) into the body, or set it as the cover).
//
// withAltPrompt — when true (body insert, SCRUM-83), a second step lets the
// admin enter alt text before the asset is committed. The empty string is a
// valid choice (decorative image). When false (cover / avatar picker), the
// modal selects immediately and alt is "".
export function ImagePicker({
  open,
  onClose,
  onSelect,
  withAltPrompt = false,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, alt: string) => void;
  withAltPrompt?: boolean;
}) {
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Asset | null>(null);
  const [altText, setAltText] = useState("");
  const altInputRef = useRef<HTMLInputElement | null>(null);

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

  // Reset the alt-prompt sub-step every time the modal is closed, so a
  // previous pending asset doesn't leak between sessions. Done via a wrapped
  // close handler (rather than an `open`-watching effect) to avoid the
  // set-state-in-effect anti-pattern.
  const closeAndReset = () => {
    setPending(null);
    setAltText("");
    onClose();
  };

  // Auto-focus the alt input when we enter the prompt step.
  useEffect(() => {
    if (pending) altInputRef.current?.focus();
  }, [pending]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (pending) {
        setPending(null);
        setAltText("");
      } else {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, pending]);

  if (!open) return null;

  const images = (assets ?? []).filter((a) => a.type.startsWith("image/"));

  function onAssetClicked(asset: Asset) {
    if (withAltPrompt) {
      // Pre-fill alt from the filename (sans extension + sanitised) as a
      // useful default the admin can refine.
      const base = asset.filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
      setPending(asset);
      setAltText(base);
      return;
    }
    onSelect(asset.url, "");
  }

  function confirmAlt() {
    if (!pending) return;
    onSelect(pending.url, altText);
    setPending(null);
    setAltText("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60" onClick={closeAndReset} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Insert image"
        className="relative flex max-h-[85vh] w-full max-w-3xl flex-col border-[3px] border-ink bg-paper shadow-brut-lg"
      >
        <header className="flex items-center justify-between border-b-[3px] border-ink bg-paper-2 px-5 py-3">
          <h2 className="font-display text-lg font-bold uppercase tracking-tight">
            {pending ? "Add alt text" : "Insert image"}
          </h2>
          <button
            type="button"
            onClick={closeAndReset}
            aria-label="Close"
            className="border-2 border-ink p-1 hover:bg-paper"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </header>

        {pending ? (
          <div className="overflow-y-auto p-5">
            <div className="flex flex-col items-start gap-5 md:flex-row md:gap-6">
              <div className="w-full max-w-[240px] shrink-0 border-[3px] border-ink bg-paper-2 shadow-brut">
                <Image
                  src={pending.url}
                  alt={pending.filename}
                  width={240}
                  height={240}
                  unoptimized
                  className="block h-auto w-full object-cover"
                />
                <p className="truncate border-t-2 border-ink px-2 py-1 font-mono text-[11px]">
                  {pending.filename}
                </p>
              </div>
              <div className="flex w-full flex-1 flex-col">
                <label htmlFor="alt-text" className="mb-2 font-display text-xs font-bold uppercase tracking-wider">
                  <span className="text-accent-2">— </span>
                  Alt text
                </label>
                <input
                  id="alt-text"
                  ref={altInputRef}
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      confirmAlt();
                    }
                  }}
                  placeholder="Describe the image for screen readers…"
                  className="w-full border-2 border-ink bg-paper-2 px-3 py-2 font-mono text-sm outline-none focus:border-accent"
                />
                <p className="mt-2 font-mono text-xs text-muted-brut">
                  Leave blank for a decorative image. Otherwise describe what&apos;s in the picture — this also becomes the inline caption.
                </p>
                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={confirmAlt}
                    className="border-2 border-ink bg-accent px-5 py-2 font-display text-sm font-bold uppercase tracking-wide shadow-brut transition-transform hover:-translate-y-0.5"
                  >
                    Insert
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPending(null);
                      setAltText("");
                    }}
                    className="border-2 border-ink bg-paper px-5 py-2 font-display text-sm font-bold uppercase tracking-wide hover:bg-paper-2"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
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
                      onClick={() => onAssetClicked(asset)}
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
        )}
      </div>
    </div>
  );
}
