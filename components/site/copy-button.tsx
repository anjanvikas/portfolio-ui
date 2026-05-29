"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

// Copy-to-clipboard button shown top-right of a code slab. Client island so the
// surrounding code block can stay a server component.
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fail silently.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy code"}
      className="flex h-8 w-8 items-center justify-center border-2 border-paper/30 bg-paper-2/10 text-paper transition-colors hover:bg-paper/20"
    >
      {copied ? (
        <Check strokeWidth={2.5} className="h-4 w-4 text-accent" />
      ) : (
        <Copy strokeWidth={2.5} className="h-4 w-4" />
      )}
    </button>
  );
}
