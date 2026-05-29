import type { Components } from "react-markdown";
import Markdown from "react-markdown";

// Brutalist markdown mapping for the project body sections. Each `## Heading`
// renders as a Space Grotesk display heading with a 64×6 chartreuse "accent
// underline" slab beneath it (project-detail wireframe §"Body sections").
// Prose is Fraunces, ink, with generous line-height for ~70ch reading.
const components: Components = {
  h2: ({ children }) => (
    <h2 className="mt-12 first:mt-0">
      <span className="block font-display text-2xl font-bold leading-tight text-ink md:text-3xl">
        {children}
      </span>
      <span className="mt-3 block h-1.5 w-16 bg-accent" aria-hidden />
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 font-display text-lg font-bold leading-tight text-ink md:text-xl">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mt-5 font-body text-base leading-[1.7] text-ink md:text-lg">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mt-5 list-disc space-y-2 pl-6 font-body text-base leading-[1.7] text-ink marker:text-accent-2 md:text-lg">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-5 list-decimal space-y-2 pl-6 font-body text-base leading-[1.7] text-ink marker:font-bold marker:text-accent-2 md:text-lg">
      {children}
    </ol>
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
  code: ({ children }) => (
    <code className="rounded border-2 border-ink bg-paper-2 px-1.5 py-0.5 font-mono text-sm text-ink">
      {children}
    </code>
  ),
};

// Renders one markdown body section. Returns null for empty content so a
// missing CMS section produces no empty heading (wireframe rule).
export function MarkdownSection({ body }: { body: string }) {
  if (!body.trim()) return null;
  return (
    <section className="mt-12 first:mt-0 md:mt-16">
      <Markdown components={components}>{body}</Markdown>
    </section>
  );
}
