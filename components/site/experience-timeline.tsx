import Markdown from "react-markdown";
import type { Components } from "react-markdown";

import type { Experience } from "@/lib/api";

// Compact markdown map for an experience entry's description — a few short
// paragraphs / lists, no headings. Lighter than the project-body MarkdownSection
// (no top margins, smaller type) so it sits tight inside a timeline row.
const descComponents: Components = {
  p: ({ children }) => (
    <p className="mt-3 font-body text-base leading-[1.7] text-muted-brut first:mt-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mt-3 list-disc space-y-1.5 pl-5 font-body text-base leading-[1.7] text-muted-brut marker:text-accent-2">
      {children}
    </ul>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-ink">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-2 hover:decoration-accent-2"
    >
      {children}
    </a>
  ),
};

// "2024-06-01" → "Jun 2024". Parsed as UTC so the day never rolls back a month
// in negative-offset timezones.
function formatMonthYear(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// A null end_date means the role is current — the AC asks for "Present".
function dateRange(start: string, end: string | null): string {
  return `${formatMonthYear(start)} — ${end ? formatMonthYear(end) : "Present"}`;
}

// The work-history timeline. A single ink rail runs down the left; each entry
// hangs off a chartreuse node. Company + role + date range as the header,
// markdown description below.
export function ExperienceTimeline({ entries }: { entries: Experience[] }) {
  if (entries.length === 0) return null;

  return (
    <ol className="relative ml-2 border-l-[3px] border-ink pl-8 md:ml-3 md:pl-10">
      {entries.map((e) => {
        const current = e.end_date === null;
        return (
          <li key={e.id} className="relative pb-12 last:pb-0">
            {/* Node on the rail — filled chartreuse for current, paper for past. */}
            <span
              aria-hidden
              className={`absolute -left-[42px] top-1.5 h-4 w-4 rounded-full border-[3px] border-ink md:-left-[50px] ${
                current ? "bg-accent" : "bg-paper"
              }`}
            />

            <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-accent-2">
              {dateRange(e.start_date, e.end_date)}
            </p>
            <h3 className="mt-2 font-display text-xl font-bold leading-tight text-ink md:text-2xl">
              {e.role}
            </h3>
            <p className="mt-1 font-body text-base font-semibold text-ink">
              {e.company}
              {e.location ? (
                <span className="font-normal text-muted-brut">
                  {" "}
                  · {e.location}
                </span>
              ) : null}
            </p>

            {e.description.trim() ? (
              <div className="mt-3">
                <Markdown components={descComponents}>{e.description}</Markdown>
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
