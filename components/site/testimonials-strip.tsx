import { Quote } from "lucide-react";

import type { Testimonial } from "@/lib/api";

// Joins a testimonial's role + company into one "Role, Company" attribution
// line, gracefully dropping either half when it's missing.
function attribution(t: Testimonial): string {
  return [t.author_role, t.author_company].filter(Boolean).join(", ");
}

// The testimonials strip — a responsive grid of brutalist quote cards (2-up at
// md+, stacked below). Each card shows the quote, author name, and role/company
// attribution.
export function TestimonialsStrip({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="grid gap-5 sm:grid-cols-2">
      {items.map((t) => {
        const attr = attribution(t);
        return (
          <li
            key={t.id}
            className="flex flex-col border-2 border-ink bg-paper-2 p-6 shadow-brut md:p-7"
          >
            <Quote
              aria-hidden
              strokeWidth={2.5}
              className="h-7 w-7 shrink-0 text-accent-2"
            />
            <blockquote className="mt-4 flex-1 font-body text-lg leading-[1.6] text-ink">
              {t.quote}
            </blockquote>
            <footer className="mt-5 border-t-2 border-ink pt-4">
              <p className="font-display text-base font-bold text-ink">
                {t.author_name}
              </p>
              {attr ? (
                <p className="mt-0.5 font-mono text-xs font-bold uppercase tracking-[0.1em] text-muted-brut">
                  {attr}
                </p>
              ) : null}
            </footer>
          </li>
        );
      })}
    </ul>
  );
}
