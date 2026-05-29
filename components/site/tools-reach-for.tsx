// Static, opinionated (not alphabetical) tool list — daily-driver first.
// See homepage wireframe §3 "Tech stack / tools bar".
const TOOLS = [
  "Go",
  "TypeScript",
  "Next.js",
  "Postgres",
  "Python",
  "Docker",
  "Fly.io",
  "Vercel",
] as const;

// Tools-I-reach-for bar. Sits on the ink (dark) slab — the page's second
// deliberate contrast flip. Chips are bright paper slabs on the dark ground.
export function ToolsReachFor() {
  return (
    <section className="bg-ink">
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-6 md:py-20">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-accent">
          {"// Tools I reach for"}
        </p>
        <ul className="mt-6 grid grid-cols-2 gap-3 md:mt-8 md:flex md:flex-wrap md:gap-4">
          {TOOLS.map((tool) => (
            <li
              key={tool}
              className="flex items-center justify-center border-2 border-ink bg-paper px-4 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-ink shadow-brut md:min-w-[168px]"
            >
              {tool}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
