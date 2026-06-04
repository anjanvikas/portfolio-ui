"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GripVertical, Plus } from "lucide-react";

import {
  ApiError,
  UNAUTHORIZED,
  type AdminExperience,
  type ExperienceInput,
  createExperience,
  deleteExperience,
  fetchAdminExperience,
  reorderExperience,
  updateExperience,
} from "@/lib/admin-experience";
import { cn } from "@/lib/utils";

type FieldErrors = Record<string, string>;
// `editing` is null (closed), "new", or an entry being edited.
type EditState = null | "new" | AdminExperience;

export default function AdminExperiencePage() {
  const router = useRouter();
  const [items, setItems] = useState<AdminExperience[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditState>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

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
        const data = await fetchAdminExperience();
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

  async function onDelete(id: string) {
    try {
      await deleteExperience(id);
      setConfirmId(null);
      setItems((prev) => prev?.filter((x) => x.id !== id) ?? null);
    } catch (err) {
      if (onUnauthorized(err)) return;
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  // ---- drag-to-reorder ---------------------------------------------------
  function onDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex || !items) {
      setDragIndex(null);
      return;
    }
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setItems(next); // optimistic
    setDragIndex(null);
    persistOrder(next.map((x) => x.id));
  }

  async function persistOrder(ids: string[]) {
    setSavingOrder(true);
    setError(null);
    try {
      const saved = await reorderExperience(ids);
      setItems(saved);
    } catch (err) {
      if (onUnauthorized(err)) return;
      setError(err instanceof Error ? err.message : "Could not save order");
      // Reload to recover the true order.
      try {
        setItems(await fetchAdminExperience());
      } catch {
        /* leave optimistic state */
      }
    } finally {
      setSavingOrder(false);
    }
  }

  function onSaved(saved: AdminExperience) {
    setItems((prev) => {
      if (!prev) return [saved];
      const exists = prev.some((x) => x.id === saved.id);
      // A new entry lands at the top (highest sort_order); an edit replaces in place.
      return exists ? prev.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...prev];
    });
    setEditing(null);
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-brut">Content</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">Experience</h1>
          <p className="mt-1 font-mono text-xs text-muted-brut">
            Drag the handle to reorder — the order saves automatically.
            {savingOrder && <span className="ml-2 text-accent-2">saving…</span>}
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
        <ExperienceForm
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
          <p className="font-display text-lg font-bold">No experience yet</p>
          <p className="mt-1 font-mono text-sm text-muted-brut">Add your first role to get started.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items?.map((item, i) => (
            <li
              key={item.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              onDragEnd={() => setDragIndex(null)}
              className={cn(
                "flex items-stretch border-2 border-ink bg-paper shadow-brut",
                dragIndex === i && "opacity-50",
              )}
            >
              <span
                className="flex cursor-grab items-center border-r-2 border-ink bg-paper-2 px-2 text-muted-brut active:cursor-grabbing"
                title="Drag to reorder"
                aria-label="Drag to reorder"
              >
                <GripVertical className="h-5 w-5" />
              </span>
              <div className="flex flex-1 flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-display font-bold">
                    {item.role} <span className="text-muted-brut">·</span> {item.company}
                  </p>
                  <p className="font-mono text-xs text-muted-brut">
                    {item.start_date} → {item.end_date ?? "Present"}
                    {item.location ? ` · ${item.location}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
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

function ExperienceForm({
  initial,
  onCancel,
  onSaved,
  onUnauthorized,
}: {
  initial?: AdminExperience;
  onCancel: () => void;
  onSaved: (e: AdminExperience) => void;
  onUnauthorized: () => void;
}) {
  const [company, setCompany] = useState(initial?.company ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [startDate, setStartDate] = useState(initial?.start_date ?? "");
  const [current, setCurrent] = useState(initial ? initial.end_date === null : true);
  const [endDate, setEndDate] = useState(initial?.end_date ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});
    const input: ExperienceInput = {
      company: company.trim(),
      role: role.trim(),
      location: location.trim(),
      start_date: startDate,
      end_date: current ? null : endDate || null,
      description,
    };
    try {
      const saved = initial ? await updateExperience(initial.id, input) : await createExperience(input);
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
    <form
      onSubmit={onSubmit}
      className="mb-8 border-[3px] border-ink bg-paper-2 p-5 shadow-brut-lg md:p-6"
    >
      <p className="mb-4 font-display text-sm font-bold uppercase tracking-wide">
        {initial ? "Edit experience" : "New experience"}
      </p>

      {error && (
        <p role="alert" className="mb-4 border-2 border-accent-2 bg-accent-2/10 px-3 py-2 font-mono text-sm">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Company" error={fieldErrors.company}>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={inputCls(fieldErrors.company)}
          />
        </FormField>
        <FormField label="Role" error={fieldErrors.role}>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={inputCls(fieldErrors.role)}
          />
        </FormField>
        <FormField label="Location" error={fieldErrors.location}>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Remote, Bengaluru, …"
            className={inputCls(fieldErrors.location)}
          />
        </FormField>
        <FormField label="Start date" error={fieldErrors.start_date}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputCls(fieldErrors.start_date)}
          />
        </FormField>
        <FormField label="End date" error={fieldErrors.end_date}>
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-mono text-sm text-muted-brut">
              <input
                type="checkbox"
                checked={current}
                onChange={(e) => setCurrent(e.target.checked)}
                className="h-4 w-4 accent-accent-2"
              />
              Current role (no end date)
            </label>
            {!current && (
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputCls(fieldErrors.end_date)}
              />
            )}
          </div>
        </FormField>
      </div>

      <div className="mt-4">
        <FormField label="Description (markdown)" error={fieldErrors.description}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full resize-y border-2 border-ink bg-paper px-3 py-2 font-mono text-sm leading-relaxed outline-none focus:border-accent"
          />
        </FormField>
      </div>

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

function FormField({
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

function inputCls(error?: string) {
  return cn(
    "w-full border-2 border-ink bg-paper px-3 py-2 font-mono text-sm outline-none focus:border-accent",
    error && "border-accent-2",
  );
}
