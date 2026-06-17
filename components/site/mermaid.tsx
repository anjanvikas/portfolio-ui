"use client";

import { useEffect, useId, useRef, useState } from "react";

// Renders a Mermaid diagram client-side. mermaid.js needs the DOM to lay out
// SVGs, so it can't run in a server component; this island lazy-loads the
// library on mount and injects the rendered SVG. The wireframe envisioned
// server-side SVGs, but that needs a headless browser — deferred for MVP.
export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "strict",
          fontFamily: "var(--font-mono)",
        });
        const { svg } = await mermaid.render(`mermaid-${id}`, chart);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (error) {
    // Fall back to the raw source rather than an empty box.
    return (
      <pre className="my-8 overflow-x-auto border-2 border-ink bg-paper-2 p-4 font-mono text-sm text-ink">
        {chart}
      </pre>
    );
  }

  return (
    <div className="my-8">
      <div className="relative border-2 border-ink bg-paper-2 p-4 md:p-6">
        <span className="absolute left-0 top-0 bg-accent-2 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-fixed">
          ▮ Mermaid
        </span>
        <div
          ref={ref}
          className="mx-auto flex max-w-[680px] justify-center overflow-x-auto pt-6 [&_svg]:h-auto [&_svg]:max-w-full"
          aria-label="Diagram"
        />
      </div>
    </div>
  );
}
