"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Image as ImageIcon, X } from "lucide-react";

import { ImagePicker } from "@/components/admin/image-picker";
import {
  ApiError,
  UNAUTHORIZED,
  type AdminProject,
  type ProjectInput,
  createProject,
  publishProject,
  updateProject,
} from "@/lib/admin-projects";
import { cn, slugify } from "@/lib/utils";

type FieldErrors = Record<string, string>;

export function ProjectEditor({ initial }: { initial?: AdminProject }) {
  const router = useRouter();

  const [id, setId] = useState<string | null>(initial?.id ?? null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugLocked, setSlugLocked] = useState(Boolean(initial));
  const [slugEditing, setSlugEditing] = useState(false);
  const [tagline, setTagline] = useState(initial?.tagline ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [bodyOverview, setBodyOverview] = useState(initial?.body_overview ?? "");
  const [bodyWhyBuilt, setBodyWhyBuilt] = useState(initial?.body_why_built ?? "");
  const [bodyLearning, setBodyLearning] = useState(initial?.body_learning ?? "");
  const [coverUrl, setCoverUrl] = useState(initial?.cover_url ?? "");
  const [repoUrl, setRepoUrl] = useState(initial?.repo_url ?? "");
  const [liveUrl, setLiveUrl] = useState(initial?.live_url ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);

  const [status, setStatus] = useState(initial?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState<string | null>(initial?.published_at ?? null);

  const [saving, setSaving] = useState<null | "draft" | "publish">(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pickingCover, setPickingCover] = useState(false);

  const dirty = savedNote === null;

  function touch() {
    setSavedNote(null);
  }

  function buildInput(): ProjectInput {
    return {
      title: title.trim(),
      slug: slug.trim(),
      tagline: tagline.trim(),
      summary: summary.trim(),
      body_overview: bodyOverview,
      body_why_built: bodyWhyBuilt,
      body_learning: bodyLearning,
      cover_url: coverUrl.trim(),
      repo_url: repoUrl.trim(),
      live_url: liveUrl.trim(),
      featured,
      tags,
    };
  }

  function applySaved(saved: AdminProject) {
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

  async function persist(kind: "draft" | "publish"): Promise<AdminProject | null> {
    setSaving(kind);
    setError(null);
    setFieldErrors({});
    try {
      const input = buildInput();
      const saved = id ? await updateProject(id, input) : await createProject(input);
      applySaved(saved);
      if (!id) {
        window.history.replaceState(null, "", `/admin/projects/${saved.id}`);
      }
      return saved;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setSaving(null);
    }
  }

  async function onSaveDraft() {
    await persist("draft");
  }

  async function onPublish() {
    const saved = await persist("publish");
    if (!saved) return;
    setSaving("publish");
    try {
      const published = await publishProject(saved.id);
      applySaved(published);
      setSavedNote("Published");
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-1px)] flex-col">
      {/* Topbar */}
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-ink bg-paper-2 px-5 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/projects" className="font-mono text-xs uppercase tracking-widest text-muted-brut hover:text-ink">
            Projects
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
              href={`/projects/${slug}`}
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
            if (!slugLocked) setSlug(slugify(v));
            touch();
          }}
          placeholder="Untitled project"
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
                  touch();
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

      {/* Two columns: metadata | three markdown body sections */}
      <div className="grid flex-1 grid-cols-1 gap-px bg-ink/15 lg:grid-cols-[340px_1fr]">
        {/* Metadata panel */}
        <aside className="space-y-6 bg-paper p-5 md:p-6">
          <Field label="Tagline">
            <input
              value={tagline}
              onChange={(e) => {
                setTagline(e.target.value);
                touch();
              }}
              placeholder="One-line hook"
              className="w-full border-2 border-ink bg-paper-2 px-3 py-2 font-mono text-sm outline-none focus:border-accent"
            />
          </Field>

          <Field label="Summary">
            <textarea
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                touch();
              }}
              rows={3}
              placeholder="Card subtitle + meta description."
              className="w-full resize-none border-2 border-ink bg-paper-2 px-3 py-2 font-mono text-sm leading-snug outline-none focus:border-accent"
            />
          </Field>

          <Field label="Tags">
            <TagInput
              tags={tags}
              onChange={(t) => {
                setTags(t);
                touch();
              }}
            />
          </Field>

          <Field label="Cover image URL">
            <div className="flex gap-2">
              <input
                value={coverUrl}
                onChange={(e) => {
                  setCoverUrl(e.target.value);
                  touch();
                }}
                placeholder="https://…"
                className="w-full border-2 border-ink bg-paper-2 px-3 py-2 font-mono text-sm outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => setPickingCover(true)}
                className="shrink-0 border-2 border-ink bg-paper px-3 font-display text-xs font-bold uppercase hover:bg-accent"
              >
                Pick
              </button>
            </div>
          </Field>

          <Field label="Repo URL">
            <input
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value);
                touch();
              }}
              placeholder="https://github.com/…"
              className="w-full border-2 border-ink bg-paper-2 px-3 py-2 font-mono text-sm outline-none focus:border-accent"
            />
          </Field>

          <Field label="Live URL">
            <input
              value={liveUrl}
              onChange={(e) => {
                setLiveUrl(e.target.value);
                touch();
              }}
              placeholder="https://…"
              className="w-full border-2 border-ink bg-paper-2 px-3 py-2 font-mono text-sm outline-none focus:border-accent"
            />
          </Field>

          <label className="flex items-center gap-3 border-2 border-ink bg-paper-2 px-3 py-2.5">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => {
                setFeatured(e.target.checked);
                touch();
              }}
              className="h-4 w-4 accent-accent-2"
            />
            <span className="font-display text-xs font-bold uppercase tracking-wide">
              Featured on homepage
            </span>
          </label>
        </aside>

        {/* Body sections */}
        <section className="space-y-px bg-ink/15">
          <BodySection
            label="Overview"
            value={bodyOverview}
            onChange={(v) => {
              setBodyOverview(v);
              touch();
            }}
          />
          <BodySection
            label="Why I built this"
            value={bodyWhyBuilt}
            onChange={(v) => {
              setBodyWhyBuilt(v);
              touch();
            }}
          />
          <BodySection
            label="Learning journey"
            value={bodyLearning}
            onChange={(v) => {
              setBodyLearning(v);
              touch();
            }}
          />
        </section>
      </div>

      <ImagePicker
        open={pickingCover}
        onClose={() => setPickingCover(false)}
        onSelect={(url) => {
          setCoverUrl(url);
          touch();
          setPickingCover(false);
        }}
      />
      {/* Per-body image picker is mounted by BodySection itself so each section
          stays self-contained. */}
    </div>
  );
}

function BodySection({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // SCRUM-83 — insert ![alt](url) at the cursor (or append) when an image is
  // picked. Mirrors the post editor's insertAtCursor so a project body gets
  // the same authoring affordance as a blog post.
  function insertAtCursor(text: string) {
    const el = textareaRef.current;
    if (!el) {
      onChange(value ? `${value}\n${text}` : text);
      return;
    }
    const { selectionStart: s, selectionEnd: e, value: v } = el;
    const next = v.slice(0, s) + text + v.slice(e);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = s + text.length;
    });
  }

  return (
    <div className="bg-paper p-5 md:p-6">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="font-display text-xs font-bold uppercase tracking-wider">
          <span className="text-accent-2">— </span>
          {label} <span className="text-muted-brut">(markdown)</span>
        </p>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="inline-flex items-center gap-1.5 border-2 border-ink bg-paper-2 px-2 py-1 font-display text-[11px] font-bold uppercase tracking-wide hover:bg-accent"
        >
          <ImageIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
          Insert image
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        placeholder={`## ${label}\n\nWrite in markdown…`}
        spellCheck
        className="w-full resize-y border-2 border-ink bg-paper-2 px-3 py-2 font-mono text-sm leading-relaxed outline-none focus:border-accent"
      />

      <ImagePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url, alt) => {
          insertAtCursor(`![${alt}](${url})`);
          setPickerOpen(false);
        }}
        withAltPrompt
      />
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

// Simple chip input: Enter adds a tag, × removes it. Projects share the global
// tag pool but a plain input is enough here (no autocomplete needed).
function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [query, setQuery] = useState("");

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
        placeholder="type a tag, press Enter…"
        className="w-full border-2 border-ink bg-paper-2 px-3 py-2 font-mono text-sm outline-none focus:border-accent"
      />
    </div>
  );
}
