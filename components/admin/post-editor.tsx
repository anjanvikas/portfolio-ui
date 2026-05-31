"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bold, Code, FileUp, Heading, Image as ImageIcon, Italic, Quote, X } from "lucide-react";

import { ImagePicker } from "@/components/admin/image-picker";
import { PostBody } from "@/components/site/post-body";
import { convertDocx } from "@/lib/admin-assets";
import {
  ApiError,
  UNAUTHORIZED,
  type AdminPost,
  type AdminSeries,
  type FieldErrors,
  type PostInput,
  createPost,
  fetchAdminSeries,
  fetchAdminTags,
  publishPost,
  updatePost,
} from "@/lib/admin-posts";
import { cn, slugify } from "@/lib/utils";

const EXCERPT_MAX = 220;

export function PostEditor({ initial }: { initial?: AdminPost }) {
  const router = useRouter();

  // ---- form state --------------------------------------------------------
  const [id, setId] = useState<string | null>(initial?.id ?? null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  // Once the slug is edited by hand it stops tracking the title (wireframe §
  // Title row). A loaded post is treated as already hand-set.
  const [slugLocked, setSlugLocked] = useState(Boolean(initial));
  const [slugEditing, setSlugEditing] = useState(false);
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [coverUrl, setCoverUrl] = useState(initial?.cover_url ?? "");
  const [seriesId, setSeriesId] = useState<string | null>(initial?.series_id ?? null);
  const [seriesOrder, setSeriesOrder] = useState<number>(initial?.series_order ?? 1);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);

  const [status, setStatus] = useState(initial?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState<string | null>(
    initial?.published_at ?? null,
  );

  // ---- selectors data ----------------------------------------------------
  const [seriesList, setSeriesList] = useState<AdminSeries[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  // ---- ui state ----------------------------------------------------------
  const [saving, setSaving] = useState<null | "draft" | "publish">(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, t] = await Promise.all([fetchAdminSeries(), fetchAdminTags()]);
        setSeriesList(s);
        setAllTags(t);
      } catch (err) {
        if (err instanceof ApiError && err.message === UNAUTHORIZED) {
          router.replace("/admin/login");
        }
        // Non-fatal: the editor still works without the selector data.
      }
    })();
  }, [router]);

  function buildInput(): PostInput {
    return {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      body,
      cover_url: coverUrl.trim(),
      series_id: seriesId,
      series_order: seriesId ? seriesOrder : null,
      tags,
    };
  }

  // Persists current state. Returns the saved post, or null on error (after
  // surfacing it). Used by both "Save draft" and "Publish".
  async function persist(kind: "draft" | "publish"): Promise<AdminPost | null> {
    setSaving(kind);
    setError(null);
    setFieldErrors({});
    try {
      const input = buildInput();
      const saved = id ? await updatePost(id, input) : await createPost(input);
      applySaved(saved);
      if (!id) {
        // First save of a new post: swap the URL to the edit route so reloads
        // and further saves target the same record (without a full nav).
        window.history.replaceState(null, "", `/admin/posts/${saved.id}`);
      }
      return saved;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setSaving(null);
    }
  }

  function applySaved(saved: AdminPost) {
    setId(saved.id);
    setSlug(saved.slug);
    setStatus(saved.status);
    setPublishedAt(saved.published_at);
    setTags(saved.tags);
    setSavedNote(`Saved ${new Date().toLocaleTimeString()}`);
  }

  function handleError(err: unknown) {
    if (err instanceof ApiError) {
      if (err.message === UNAUTHORIZED) {
        router.replace("/admin/login");
        return;
      }
      if (err.fieldErrors) setFieldErrors(err.fieldErrors);
      setError(err.message);
      return;
    }
    setError(err instanceof Error ? err.message : "Something went wrong");
  }

  async function onSaveDraft() {
    await persist("draft");
  }

  async function onPublish() {
    const saved = await persist("publish");
    if (!saved) return;
    setSaving("publish");
    try {
      const published = await publishPost(saved.id);
      applySaved(published);
      setSavedNote("Published");
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(null);
    }
  }

  // ---- markdown toolbar --------------------------------------------------
  function wrapSelection(before: string, after = before) {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const selected = value.slice(s, e);
    const next = value.slice(0, s) + before + selected + after + value.slice(e);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = s + before.length;
      el.selectionEnd = e + before.length;
    });
  }
  function prefixLine(prefix: string) {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart: s, value } = el;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    setBody(value.slice(0, lineStart) + prefix + value.slice(lineStart));
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = s + prefix.length;
    });
  }
  function insertAtCursor(text: string) {
    const el = bodyRef.current;
    if (!el) {
      // No focus yet (e.g. picking a cover) — append to the end.
      setBody((b) => (b ? `${b}\n${text}` : text));
      setSavedNote(null);
      return;
    }
    const { selectionStart: s, selectionEnd: e, value } = el;
    const next = value.slice(0, s) + text + value.slice(e);
    setBody(next);
    setSavedNote(null);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = s + text.length;
    });
  }

  // ---- image picker + docx import ----------------------------------------
  // picker mode decides what a chosen asset URL does: insert into the body or
  // become the cover image.
  const [picker, setPicker] = useState<null | "body" | "cover">(null);
  const [importing, setImporting] = useState(false);
  const docxRef = useRef<HTMLInputElement>(null);

  function onPickAsset(url: string) {
    if (picker === "cover") {
      setCoverUrl(url);
      setSavedNote(null);
    } else {
      insertAtCursor(`![](${url})`);
    }
    setPicker(null);
  }

  async function onImportDocx(file: File | undefined) {
    if (!file) return;
    setImporting(true);
    setError(null);
    try {
      const markdown = await convertDocx(file);
      insertAtCursor(body.trim() ? `\n\n${markdown}` : markdown);
    } catch (err) {
      if (err instanceof ApiError && err.message === UNAUTHORIZED) {
        router.replace("/admin/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setImporting(false);
    }
  }

  const dirty = savedNote === null;

  return (
    <div className="flex min-h-[calc(100vh-1px)] flex-col">
      {/* Topbar */}
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-ink bg-paper-2 px-5 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/posts" className="font-mono text-xs uppercase tracking-widest text-muted-brut hover:text-ink">
            Posts
          </Link>
          <span className="font-mono text-xs text-muted-brut">·</span>
          <span className="font-mono text-xs uppercase tracking-widest text-ink">
            {id ? "Editor" : "New"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span aria-live="polite" className="font-mono text-xs text-muted-brut">
            {saving ? "Saving…" : dirty ? "Unsaved changes" : savedNote}
          </span>
          {status === "published" && (
            <Link
              href={`/blog/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="border-2 border-ink px-3 py-2 font-display text-xs font-bold uppercase tracking-wide hover:bg-paper"
            >
              View ↗
            </Link>
          )}
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={saving !== null}
            className="border-2 border-ink bg-paper px-3 py-2 font-display text-xs font-bold uppercase tracking-wide shadow-brut transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={saving !== null}
            className="border-2 border-ink bg-accent px-3 py-2 font-display text-xs font-bold uppercase tracking-wide shadow-brut transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {status === "published" ? "Update ↻" : "Publish →"}
          </button>
        </div>
      </header>

      {error && (
        <p role="alert" className="border-b-2 border-accent-2 bg-accent-2/10 px-5 py-2 font-mono text-sm md:px-8">
          {error}
        </p>
      )}

      {/* Title + slug row */}
      <div className="border-b-2 border-ink px-5 py-5 md:px-8">
        <input
          value={title}
          onChange={(e) => {
            const v = e.target.value;
            setTitle(v);
            // Slug tracks the title until the author edits it by hand.
            if (!slugLocked) setSlug(slugify(v));
            setSavedNote(null);
          }}
          placeholder="Untitled post"
          className={cn(
            "w-full border-0 border-b-[3px] border-transparent bg-transparent font-display text-3xl font-bold leading-tight outline-none placeholder:text-muted-brut/50 focus:border-accent md:text-5xl",
            fieldErrors.title && "border-accent-2",
          )}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono text-sm text-muted-brut">
            <span>slug ·</span>
            {slugEditing ? (
              <input
                value={slug}
                autoFocus
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugLocked(true);
                  setSavedNote(null);
                }}
                onBlur={() => setSlugEditing(false)}
                className="border-2 border-ink bg-paper px-2 py-0.5 font-mono text-sm text-ink outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => setSlugEditing(true)}
                className="text-ink underline decoration-dotted underline-offset-4 hover:decoration-accent"
                title="Edit slug"
              >
                {slug || "—"}
              </button>
            )}
          </div>
          <span
            className={cn(
              "inline-block border-2 border-ink px-2 py-0.5 font-display text-xs font-bold uppercase tracking-wide",
              status === "published" ? "bg-accent" : "bg-paper-2 text-muted-brut",
            )}
          >
            status · {status}
            {publishedAt ? ` · ${publishedAt}` : ""}
          </span>
        </div>
      </div>

      {/* Three columns: metadata | editor | preview */}
      <div className="grid flex-1 grid-cols-1 gap-px bg-ink/15 lg:grid-cols-[320px_1fr_1fr]">
        {/* Metadata panel */}
        <aside className="space-y-6 bg-paper p-5 md:p-6">
          <Field label="Series">
            <select
              value={seriesId ?? ""}
              onChange={(e) => {
                setSeriesId(e.target.value || null);
                setSavedNote(null);
              }}
              className="w-full border-2 border-ink bg-paper-2 px-3 py-2 font-mono text-sm outline-none focus:border-accent"
            >
              <option value="">— None —</option>
              {seriesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {seriesId && (
              <label className="mt-2 flex items-center gap-2 font-mono text-sm text-muted-brut">
                Part
                <input
                  type="number"
                  min={1}
                  value={seriesOrder}
                  onChange={(e) => {
                    setSeriesOrder(Math.max(1, Number(e.target.value) || 1));
                    setSavedNote(null);
                  }}
                  className="w-16 border-2 border-ink bg-paper px-2 py-1 font-mono text-sm outline-none focus:border-accent"
                />
              </label>
            )}
          </Field>

          <Field label="Tags">
            <TagInput
              tags={tags}
              suggestions={allTags}
              onChange={(t) => {
                setTags(t);
                setSavedNote(null);
              }}
            />
          </Field>

          <Field label="Cover image URL">
            <div className="flex gap-2">
              <input
                value={coverUrl}
                onChange={(e) => {
                  setCoverUrl(e.target.value);
                  setSavedNote(null);
                }}
                placeholder="https://…"
                className="w-full border-2 border-ink bg-paper-2 px-3 py-2 font-mono text-sm outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => setPicker("cover")}
                className="shrink-0 border-2 border-ink bg-paper px-3 font-display text-xs font-bold uppercase hover:bg-accent"
              >
                Pick
              </button>
            </div>
          </Field>

          <Field label="Excerpt">
            <textarea
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value.slice(0, EXCERPT_MAX));
                setSavedNote(null);
              }}
              rows={3}
              placeholder="Card subtitle + meta description."
              className="w-full resize-none border-2 border-ink bg-paper-2 px-3 py-2 font-mono text-sm leading-snug outline-none focus:border-accent"
            />
            <p className="mt-1 text-right font-mono text-xs text-muted-brut">
              {excerpt.length}/{EXCERPT_MAX}
            </p>
          </Field>
        </aside>

        {/* Editor pane */}
        <section className="flex flex-col bg-ink">
          <div className="flex items-center gap-1 border-b-2 border-paper/20 bg-ink px-3 py-2">
            <ToolbarBtn label="Bold" onClick={() => wrapSelection("**")}>
              <Bold className="h-4 w-4" />
            </ToolbarBtn>
            <ToolbarBtn label="Italic" onClick={() => wrapSelection("_")}>
              <Italic className="h-4 w-4" />
            </ToolbarBtn>
            <ToolbarBtn label="Heading" onClick={() => prefixLine("## ")}>
              <Heading className="h-4 w-4" />
            </ToolbarBtn>
            <ToolbarBtn label="Inline code" onClick={() => wrapSelection("`")}>
              <Code className="h-4 w-4" />
            </ToolbarBtn>
            <ToolbarBtn label="Quote" onClick={() => prefixLine("> ")}>
              <Quote className="h-4 w-4" />
            </ToolbarBtn>
            <ToolbarBtn label="Insert image" onClick={() => setPicker("body")}>
              <ImageIcon className="h-4 w-4" />
            </ToolbarBtn>
            <div className="ml-auto">
              <ToolbarBtn
                label={importing ? "Converting…" : "Import .docx"}
                onClick={() => docxRef.current?.click()}
                disabled={importing}
              >
                <FileUp className="h-4 w-4" />
              </ToolbarBtn>
            </div>
            <input
              ref={docxRef}
              type="file"
              accept=".docx"
              className="hidden"
              onChange={(e) => {
                onImportDocx(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setSavedNote(null);
            }}
            placeholder="# Write your post in markdown…"
            spellCheck
            className="min-h-[60vh] flex-1 resize-none bg-ink px-5 py-4 font-mono text-sm leading-relaxed text-paper caret-accent outline-none selection:bg-accent selection:text-ink"
          />
        </section>

        {/* Preview pane — same renderer as /blog/[slug] (no drift) */}
        <section className="overflow-y-auto bg-paper p-5 md:p-6">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-brut">
            Preview
          </p>
          {body.trim() ? (
            <PostBody body={body} />
          ) : (
            <p className="font-body text-muted-brut">Nothing to preview yet.</p>
          )}
        </section>
      </div>

      <ImagePicker open={picker !== null} onClose={() => setPicker(null)} onSelect={onPickAsset} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 font-display text-xs font-bold uppercase tracking-wider">
        <span className="text-accent-2">— </span>
        {label}
      </p>
      {children}
    </div>
  );
}

function ToolbarBtn({
  label,
  onClick,
  children,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center border-2 border-paper/30 bg-ink text-paper hover:border-accent hover:text-accent disabled:opacity-40"
    >
      {children}
    </button>
  );
}

// Tag chips + autocomplete. Enter (or click) adds a tag; suggestions filter the
// existing tag list; an exact-miss offers "+ create".
function TagInput({
  tags,
  suggestions,
  onChange,
}: {
  tags: string[];
  suggestions: string[];
  onChange: (tags: string[]) => void;
}) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return suggestions
      .filter(
        (s) =>
          s.toLowerCase().includes(q) &&
          !tags.some((t) => t.toLowerCase() === s.toLowerCase()),
      )
      .slice(0, 6);
  }, [query, suggestions, tags]);

  const exactExists =
    matches.some((m) => m.toLowerCase() === query.trim().toLowerCase()) ||
    tags.some((t) => t.toLowerCase() === query.trim().toLowerCase());

  function add(name: string) {
    const v = name.trim();
    if (!v) return;
    if (!tags.some((t) => t.toLowerCase() === v.toLowerCase())) {
      onChange([...tags, v]);
    }
    setQuery("");
  }

  return (
    <div>
      {tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 border-2 border-ink bg-paper px-2 py-0.5 font-mono text-xs"
            >
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="text-muted-brut hover:text-accent-2"
              >
                <X className="h-3 w-3" strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(query);
          }
        }}
        placeholder="type to autocomplete…"
        className="w-full border-2 border-ink bg-paper-2 px-3 py-2 font-mono text-sm outline-none focus:border-accent"
      />
      {(matches.length > 0 || (query.trim() && !exactExists)) && (
        <ul className="mt-1 border-2 border-ink bg-paper">
          {matches.map((m) => (
            <li key={m}>
              <button
                type="button"
                onClick={() => add(m)}
                className="block w-full px-3 py-1.5 text-left font-mono text-sm hover:bg-accent"
              >
                {m}
              </button>
            </li>
          ))}
          {query.trim() && !exactExists && (
            <li>
              <button
                type="button"
                onClick={() => add(query)}
                className="block w-full px-3 py-1.5 text-left font-mono text-sm hover:bg-accent"
              >
                + create “{query.trim()}”
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
