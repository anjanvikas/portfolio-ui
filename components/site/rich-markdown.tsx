import type { Components } from "react-markdown";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import { CodeBlock } from "@/components/site/code-block";
import { Mermaid } from "@/components/site/mermaid";
import { slugify } from "@/lib/utils";

type HastNode = {
  type?: string;
  value?: string;
  tagName?: string;
  properties?: { className?: string | string[] };
  children?: HastNode[];
};

function nodeText(node: HastNode | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(nodeText).join("");
}

function langFromClass(className?: string | string[]): string {
  const cls = Array.isArray(className) ? className.join(" ") : (className ?? "");
  const m = /language-([\w-]+)/.exec(cls);
  return m ? m[1] : "";
}

// The shared brutalist component map (SCRUM-80). Used by blog post bodies,
// project detail sections, and the About bio so all three render identically.
// Tables (SCRUM-79) and inline images (SCRUM-81) are styled in this map so
// every consumer gets them for free.
export const richMarkdownComponents: Components = {
  h2({ node, children }) {
    const id = slugify(nodeText(node as HastNode));
    return (
      <h2 id={id} className="mt-14 scroll-mt-28 first:mt-0">
        <span className="block font-display text-2xl font-bold leading-tight text-ink md:text-3xl">
          {children}
        </span>
        <span className="mt-3 block h-1.5 w-16 bg-accent" aria-hidden />
      </h2>
    );
  },
  h3: ({ children }) => (
    <h3 className="mt-10 font-display text-lg font-bold leading-tight text-ink md:text-xl">
      {children}
    </h3>
  ),
  p: ({ node, children }) => {
    // react-markdown wraps a markdown image in <p>, but our img override emits
    // a block <figure>/<figcaption> — invalid inside <p>, which throws hydration
    // errors on every project/blog page. When the paragraph contains an image
    // (alone or mixed with trailing text), render a <div> with the identical
    // className instead: <figure> is legal inside <div>, and a <div> and <p>
    // with the same classes render identically, so the visual output is
    // unchanged. We read the HAST node — the React children's .type is the img
    // override fn, never the string "img".
    const hasImage = ((node as HastNode)?.children ?? []).some(
      (c) => c.type === "element" && c.tagName === "img"
    );
    const Tag = hasImage ? "div" : "p";
    return (
      <Tag className="mt-5 font-body text-base leading-[1.75] text-ink md:text-lg">
        {children}
      </Tag>
    );
  },
  ul: ({ children }) => (
    <ul className="mt-5 list-disc space-y-2 pl-6 font-body text-base leading-[1.75] text-ink marker:text-accent-2 md:text-lg">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-5 list-decimal space-y-2 pl-6 font-body text-base leading-[1.75] text-ink marker:font-bold marker:text-accent-2 md:text-lg">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-ink">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-[3px] border-ink pl-6 font-body text-base font-semibold leading-[1.7] text-ink md:text-lg [&>p]:mt-0">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4 hover:decoration-accent-2"
    >
      {children}
    </a>
  ),
  code: ({ className, children }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="border-2 border-ink bg-paper-2 px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
        {children}
      </code>
    ),
  pre: ({ node, children }) => {
    const codeNode = (node as HastNode)?.children?.[0];
    const lang = langFromClass(codeNode?.properties?.className);
    const raw = nodeText(codeNode);
    if (lang === "mermaid") {
      return <Mermaid chart={raw} />;
    }
    return (
      <CodeBlock language={lang} raw={raw}>
        {children}
      </CodeBlock>
    );
  },

  // SCRUM-81 — Brutalist inline image: ink-framed, responsive, optional
  // caption from alt/title. Bounded max-height + object-contain keep a
  // broken src from blowing up the layout.
  img: ({ src, alt, title }) => {
    const caption = (typeof title === "string" && title) || alt || "";
    return (
      <figure className="mt-6 first:mt-0">
        {/* Plain <img> so users can paste any URL — the Next image optimizer's
            allowlist would block external hosts the admin hasn't whitelisted. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={typeof src === "string" ? src : ""}
          alt={alt ?? ""}
          loading="lazy"
          decoding="async"
          className="block h-auto max-h-[640px] w-full border-[3px] border-ink object-contain shadow-brut"
        />
        {caption ? (
          <figcaption className="mt-2 text-center font-mono text-xs text-muted-brut">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    );
  },

  // SCRUM-79 — Brutalist GFM table: ink borders, mono uppercase header row,
  // zebra body rows, horizontal scroll on small viewports.
  table: ({ children }) => (
    <div className="mt-6 -mx-4 overflow-x-auto border-y-[3px] border-ink bg-paper md:mx-0 md:border-x-[3px]">
      <table className="w-full min-w-[480px] border-collapse font-body text-sm text-ink md:text-base">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-ink text-paper">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="even:bg-paper-2 [thead_&]:even:bg-ink">{children}</tr>
  ),
  th: ({ children, style }) => (
    <th
      style={style}
      className="border-[2px] border-paper px-3 py-2 text-left font-mono text-xs font-bold uppercase tracking-wide md:text-sm"
    >
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td
      style={style}
      className="border-[2px] border-ink px-3 py-2 align-top leading-snug"
    >
      {children}
    </td>
  ),
};

// Renders a markdown body with the shared brutalist component map. Server
// component: remark-gfm + the syntax highlighter run at render time; only
// Mermaid + the copy button hydrate client-side.
export function RichMarkdown({ body }: { body: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypeHighlight, { ignoreMissing: true, detect: true }]]}
      components={richMarkdownComponents}
    >
      {body}
    </Markdown>
  );
}

// Extracts the body's H2 headings (id + text) for the on-this-page TOC. Mirrors
// the h2 renderer's slugify so anchor links resolve. Skips fenced code blocks
// and ### subheadings.
export function extractHeadings(markdown: string): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      const text = m[1].replace(/[#*`_]/g, "").trim();
      out.push({ id: slugify(text), text });
    }
  }
  return out;
}
