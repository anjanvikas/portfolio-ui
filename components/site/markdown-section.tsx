import { RichMarkdown } from "@/components/site/rich-markdown";

// Renders one markdown body section using the shared brutalist renderer
// (SCRUM-80). Used by project detail bodies and the About bio so both pick up
// remark-gfm, syntax highlighting, framed images, and branded tables identical
// to blog posts. Returns null for empty content so a missing CMS section
// produces no empty heading (wireframe rule).
export function MarkdownSection({ body }: { body: string }) {
  if (!body.trim()) return null;
  return (
    <section className="mt-12 first:mt-0 md:mt-16">
      <RichMarkdown body={body} />
    </section>
  );
}
