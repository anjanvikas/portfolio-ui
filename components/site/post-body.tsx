import type { Components } from "react-markdown";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import { CodeBlock } from "@/components/site/code-block";
import { Mermaid } from "@/components/site/mermaid";
import { slugify } from "@/lib/utils";

// Loose hast-node shape — react-markdown passes the source node to component
// renderers so we can recover the raw text and language of a code fence.
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

// Brutalist markdown mapping for blog post bodies. Headings carry the chartreuse
// accent-underline rule shared with project detail; code fences become dark
// slabs (with a copy button) and ```mermaid fences render as diagrams.
const components: Components = {
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
  p: ({ children }) => (
    <p className="mt-5 font-body text-base leading-[1.75] text-ink md:text-lg">
      {children}
    </p>
  ),
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
  // Block code keeps its hljs/language classes (the .hljs CSS does the coloring);
  // inline code gets the brutalist slab pill.
  code: ({ className, children }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="border-2 border-ink bg-paper-2 px-1.5 py-0.5 font-mono text-[0.85em] text-ink">
        {children}
      </code>
    ),
  // The <pre> wrapper carries the language + raw text, so we decide here whether
  // to render a Mermaid diagram or a syntax-highlighted code slab.
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
};

// Renders a blog post's markdown body. Server component: remark-gfm + the
// syntax highlighter run at render time; only Mermaid + the copy button hydrate.
export function PostBody({ body }: { body: string }) {
  return (
    <div className="font-body">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { ignoreMissing: true, detect: true }]]}
        components={components}
      >
        {body}
      </Markdown>
    </div>
  );
}

// Extracts the post's H2 headings (id + text) for the on-this-page TOC. Mirrors
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
