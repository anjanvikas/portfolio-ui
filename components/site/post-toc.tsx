"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string };

// Sticky right-rail table of contents, desktop (lg+) only. Lists the post's H2
// headings and highlights the section currently in view via IntersectionObserver
// (no scroll-linked animation — just a class swap, within the motion budget).
export function PostToc({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: 0 },
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      className="sticky top-24 hidden w-[220px] shrink-0 lg:block"
    >
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
        On this page
      </p>
      <span className="mt-3 block h-1.5 w-16 bg-accent" aria-hidden />

      <ul className="mt-4 space-y-1">
        {headings.map((h) => {
          const active = h.id === activeId;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={`block px-2 py-1 font-body text-sm leading-snug transition-colors ${
                  active
                    ? "bg-accent font-semibold text-ink"
                    : "text-muted-brut hover:text-ink"
                }`}
              >
                {active && <span aria-hidden>▸ </span>}
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 border-t-2 border-ink pt-3">
        <a
          href="#top"
          className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-brut hover:text-ink"
        >
          ↑ Top
        </a>
      </div>
    </nav>
  );
}
