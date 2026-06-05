// Back-compat shim — PostBody and extractHeadings now live in rich-markdown.tsx
// (SCRUM-80). PostBody keeps its dedicated wrapper so the blog post page and
// the admin editor preview don't have to change their imports.
import { RichMarkdown } from "@/components/site/rich-markdown";

export { extractHeadings } from "@/components/site/rich-markdown";

export function PostBody({ body }: { body: string }) {
  return (
    <div className="font-body">
      <RichMarkdown body={body} />
    </div>
  );
}
