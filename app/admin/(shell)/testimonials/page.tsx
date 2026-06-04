"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Plus } from "lucide-react";

import {
  ApiError,
  UNAUTHORIZED,
  type AdminTestimonial,
  type TestimonialInput,
  createTestimonial,
  deleteTestimonial,
  fetchAdminTestimonials,
  setTestimonialVisibility,
  updateTestimonial,
} from "@/lib/admin-testimonials";
import { cn } from "@/lib/utils";

type FieldErrors = Record<string, string>;
type EditState = null | "new" | AdminTestimonial;

export default function AdminTestimonialsPage() {
  const router = useRouter();
  const [items, setItems] = useState<AdminTestimonial[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditState>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function onUnauthorized(err: unknown): boolean {
    if (err instanceof ApiError && err.message === UNAUTHORIZED) {
      router.replace("/admin/login");
      return true;
    }
    return false;
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAdminTestimonials();
        if (!cancelled) setItems(data);
      } catch (err) {
        if (onUnauthorized(err)) return;
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function onToggle(item: AdminTestimonial) {
    setTogglingId(item.id);
    try {
      const saved = await setTestimonialVisibility(item.id, !item.visible);
      setItems((prev) => prev?.map((x) => (x.id === saved.id ? saved : x)) ?? null);
    } catch (err) {
      if (onUnauthorized(err)) return;
      setError(err instanceof Error ? err.message : "Could not change visibility");
    } finally {
      setTogglingId(null);
    }
  }

  async function onDelete(id: string) {
    try {
      await deleteTestimonial(id);
      setConfirmId(null);
      setItems((prev) => prev?.filter((x) => x.id !== id) ?? null);
    } catch (err) {
      if (onUnauthorized(err)) return;
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function onSaved(saved: AdminTestimonial) {
    setItems((prev) => {
      if (!prev) return [saved];
      const exists = prev.some((x) => x.id === saved.id);
      return exists ? prev.map((x) => (x.id === saved.id ? saved : x)) : [...prev, saved];
    });
    setEditing(null);
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-brut">Content</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">Testimonials</h1>
          <p className="mt-1 font-mono text-xs text-muted-brut">
            Hidden testimonials stay off the public site.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 border-2 border-ink bg-accent px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide shadow-brut transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          New
        </button>
      </header>

      {error && (
        <p role="alert" className="mb-6 border-2 border-accent-2 bg-accent-2/10 px-4 py-3 font-mono text-sm">
          {error}
        </p>
      )}

      {editing !== null && (
        <TestimonialForm
          key={editing === "new" ? "new" : editing.id}
          initial={editing === "new" ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSaved={onSaved}
          onUnauthorized={() => router.replace("/admin/login")}
        />
      )}

      {items === null && !error ? (
        <p className="font-mono text-sm text-muted-brut">Loading…</p>
      ) : items && items.length === 0 ? (
        <div className="border-2 border-dashed border-ink bg-paper-2 px-6 py-12 text-center">
          <p className="font-display text-lg font-bold">No testimonials yet</p>
          <p className="mt-1 font-mono text-sm text-muted-brut">Add your first quote to get started.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items?.map((item) => (
            <li
              key={item.id}
              className={cn(
                "border-2 border-ink bg-paper shadow-brut",
                !item.visible && "opacity-60",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                <div className="max-w-xl">
                  <p className="font-body text-sm leading-snug">“{item.quote}”</p>
                  <p className="mt-1 font-display text-xs font-bold uppercase tracking-wide">
                    {item.author_name}
                    <span className="text-muted-brut">
                      {item.author_role ? ` · ${item.author_role}` : ""}
                      {item.author_company ? `, ${item.author_company}` : ""}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggle(item)}
                    disabled={togglingId === item.id}
                    title={item.visible ? "Visible — click to hide" : "Hidden — click to show"}
                    className={cn(
                      "inline-flex items-center gap-1.5 border-2 border-ink px-2.5 py-1 font-display text-xs font-bold uppercase tracking-wide",
                      item.visible ? "bg-accent" : "bg-paper-2 text-muted-brut",
                    )}
                  >
                    {item.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    {item.visible ? "Visible" : "Hidden"}
                  </button>
                  {confirmId === item.id ? (
                    <>
                      <span className="font-mono text-xs text-muted-brut">Delete?</span>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="border-2 border-ink px-2.5 py-1 font-display text-xs font-bold uppercase hover:bg-paper-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="border-2 border-ink bg-accent-2 px-2.5 py-1 font-display text-xs font-bold uppercase text-paper hover:-translate-y-0.5"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditing(item)}
                        className="border-2 border-ink px-2.5 py-1 font-display text-xs font-bold uppercase hover:bg-paper-2"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(item.id)}
                        className="border-2 border-ink px-2.5 py-1 font-display text-xs font-bold uppercase text-accent-2 hover:bg-accent-2 hover:text-paper"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TestimonialForm({
  initial,
  onCancel,
  onSaved,
  onUnauthorized,
}: {
  initial?: AdminTestimonial;
  onCancel: () => void;
  onSaved: (t: AdminTestimonial) => void;
  onUnauthorized: () => void;
}) {
  const [authorName, setAuthorName] = useState(initial?.author_name ?? "");
  const [authorRole, setAuthorRole] = useState(initial?.author_role ?? "");
  const [authorCompany, setAuthorCompany] = useState(initial?.author_company ?? "");
  const [quote, setQuote] = useState(initial?.quote ?? "");
  const [visible, setVisible] = useState(initial?.visible ?? true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});
    const input: TestimonialInput = {
      author_name: authorName.trim(),
      author_role: authorRole.trim(),
      author_company: authorCompany.trim(),
      quote: quote.trim(),
      visible,
    };
    try {
      const saved = initial
        ? await updateTestimonial(initial.id, input)
        : await createTestimonial(input);
      onSaved(saved);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.message === UNAUTHORIZED) {
          onUnauthorized();
          return;
        }
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mb-8 border-[3px] border-ink bg-paper-2 p-5 shadow-brut-lg md:p-6">
      <p className="mb-4 font-display text-sm font-bold uppercase tracking-wide">
        {initial ? "Edit testimonial" : "New testimonial"}
      </p>

      {error && (
        <p role="alert" className="mb-4 border-2 border-accent-2 bg-accent-2/10 px-3 py-2 font-mono text-sm">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Labeled label="Author" error={fieldErrors.author_name}>
          <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className={fieldCls(fieldErrors.author_name)}
          />
        </Labeled>
        <Labeled label="Role" error={fieldErrors.author_role}>
          <input
            value={authorRole}
            onChange={(e) => setAuthorRole(e.target.value)}
            className={fieldCls(fieldErrors.author_role)}
          />
        </Labeled>
        <Labeled label="Company" error={fieldErrors.author_company}>
          <input
            value={authorCompany}
            onChange={(e) => setAuthorCompany(e.target.value)}
            className={fieldCls(fieldErrors.author_company)}
          />
        </Labeled>
      </div>

      <div className="mt-4">
        <Labeled label="Quote" error={fieldErrors.quote}>
          <textarea
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            rows={3}
            className={cn(
              "w-full resize-y border-2 border-ink bg-paper px-3 py-2 font-mono text-sm leading-relaxed outline-none focus:border-accent",
              fieldErrors.quote && "border-accent-2",
            )}
          />
        </Labeled>
      </div>

      <label className="mt-4 flex items-center gap-2 font-mono text-sm text-muted-brut">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => setVisible(e.target.checked)}
          className="h-4 w-4 accent-accent-2"
        />
        Visible on the public site
      </label>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="border-2 border-ink bg-accent px-4 py-2 font-display text-xs font-bold uppercase tracking-wide shadow-brut transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border-2 border-ink bg-paper px-4 py-2 font-display text-xs font-bold uppercase tracking-wide hover:bg-paper-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Labeled({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 font-display text-xs font-bold uppercase tracking-wider">
        <span className="text-accent-2">— </span>
        {label}
      </p>
      {children}
      {error && <p className="mt-1 font-mono text-xs text-accent-2">{error}</p>}
    </div>
  );
}

function fieldCls(error?: string) {
  return cn(
    "w-full border-2 border-ink bg-paper px-3 py-2 font-mono text-sm outline-none focus:border-accent",
    error && "border-accent-2",
  );
}
