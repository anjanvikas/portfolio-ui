import type { ReactNode } from "react";

import { CopyButton } from "@/components/site/copy-button";

// The dark code slab (dark even in light mode — design-tokens.md §11). Server
// component: the syntax-highlighted `children` come pre-rendered from
// rehype-highlight, and the only interactive bit (copy) is a client island.
// Colors are fixed (not the theme-swapping ink/paper vars) so the slab reads
// dark regardless of the active color scheme.
export function CodeBlock({
  language,
  raw,
  children,
}: {
  language: string;
  raw: string;
  children: ReactNode;
}) {
  return (
    <div className="my-8 overflow-hidden border-2 border-[#0E0E10] bg-[#0E0E10] -mx-5 md:mx-0">
      <div className="flex items-center justify-between border-b border-paper/15 px-3 py-2">
        <span className="bg-accent px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#0E0E10]">
          ▮ {language || "code"}
        </span>
        <CopyButton text={raw} />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-[#FAFAF5]">
        {children}
      </pre>
    </div>
  );
}
