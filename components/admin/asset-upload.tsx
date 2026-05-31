"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

import { type Asset, uploadAsset } from "@/lib/admin-assets";
import { cn } from "@/lib/utils";

type UploadItem = {
  name: string;
  progress: number; // 0..1
  status: "uploading" | "done" | "error";
  error?: string;
};

// AssetUpload is the shared drag-and-drop zone: drop or browse to upload files
// straight to R2 (via presign), with a per-file progress bar and inline error
// handling. Each successful upload fires onUploaded with the registered Asset.
export function AssetUpload({
  onUploaded,
  accept = "image/*",
  className,
}: {
  onUploaded: (asset: Asset) => void;
  accept?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);

  function updateItem(name: string, patch: Partial<UploadItem>) {
    setItems((prev) => prev.map((it) => (it.name === name ? { ...it, ...patch } : it)));
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setItems((prev) => [
      ...prev.filter((it) => it.status !== "done"),
      ...list.map((f) => ({ name: f.name, progress: 0, status: "uploading" as const })),
    ]);

    // Upload sequentially so progress reads cleanly and we don't hammer R2.
    for (const file of list) {
      try {
        const asset = await uploadAsset(file, (p) => updateItem(file.name, { progress: p }));
        updateItem(file.name, { progress: 1, status: "done" });
        onUploaded(asset);
      } catch (err) {
        updateItem(file.name, {
          status: "error",
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }
    }
  }

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-ink px-6 py-10 text-center transition-colors",
          dragging ? "bg-accent/20" : "bg-paper-2 hover:bg-accent/10",
        )}
      >
        <UploadCloud className="h-7 w-7" strokeWidth={2} />
        <p className="font-display text-sm font-bold uppercase tracking-wide">
          Drop files or click to upload
        </p>
        <p className="font-mono text-xs text-muted-brut">
          Uploaded directly to R2 · {accept === "image/*" ? "images" : accept}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = ""; // allow re-selecting the same file
          }}
        />
      </div>

      {items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {items.map((it) => (
            <li key={it.name} className="border-2 border-ink bg-paper px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-mono text-xs">{it.name}</span>
                <span
                  className={cn(
                    "font-mono text-xs uppercase",
                    it.status === "error" ? "text-accent-2" : "text-muted-brut",
                  )}
                >
                  {it.status === "done"
                    ? "Done"
                    : it.status === "error"
                      ? "Failed"
                      : `${Math.round(it.progress * 100)}%`}
                </span>
              </div>
              {it.status !== "error" ? (
                <div className="mt-1.5 h-1.5 w-full bg-paper-2">
                  <div
                    className="h-full bg-accent transition-[width]"
                    style={{ width: `${Math.round(it.progress * 100)}%` }}
                  />
                </div>
              ) : (
                <p className="mt-1 font-mono text-xs text-accent-2">{it.error}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
