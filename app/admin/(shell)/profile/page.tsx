"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ImagePicker } from "@/components/admin/image-picker";
import {
  ApiError,
  UNAUTHORIZED,
  type ProfileInput,
  fetchAdminProfile,
  updateProfile,
} from "@/lib/admin-profile";
import { cn } from "@/lib/utils";

type FieldErrors = Record<string, string>;

export default function AdminProfilePage() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pickingAvatar, setPickingAvatar] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await fetchAdminProfile();
        if (cancelled) return;
        setName(p.name);
        setHeadline(p.headline);
        setBio(p.bio);
        setLocation(p.location);
        setEmail(p.email);
        setAvatarUrl(p.avatar_url);
        setResumeUrl(p.resume_url);
        setLoaded(true);
      } catch (err) {
        if (err instanceof ApiError && err.message === UNAUTHORIZED) {
          router.replace("/admin/login");
          return;
        }
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Failed to load profile");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  function touch() {
    setSavedNote(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});
    const input: ProfileInput = {
      name: name.trim(),
      headline: headline.trim(),
      bio,
      location: location.trim(),
      email: email.trim(),
      avatar_url: avatarUrl.trim(),
      resume_url: resumeUrl.trim(),
    };
    try {
      const saved = await updateProfile(input);
      setSavedNote(`Saved ${new Date().toLocaleTimeString()}`);
      setAvatarUrl(saved.avatar_url);
      setResumeUrl(saved.resume_url);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.message === UNAUTHORIZED) {
          router.replace("/admin/login");
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

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <p className="font-display text-xl font-bold">{loadError}</p>
      </div>
    );
  }

  if (!loaded) {
    return <p className="px-5 py-10 font-mono text-sm text-muted-brut md:px-8">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8 md:py-10">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-brut">Settings</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">Profile</h1>
        </div>
        <span aria-live="polite" className="font-mono text-xs text-muted-brut">
          {saving ? "Saving…" : savedNote}
        </span>
      </header>

      {error && (
        <p role="alert" className="mb-6 border-2 border-accent-2 bg-accent-2/10 px-4 py-3 font-mono text-sm">
          {error}
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Name" error={fieldErrors.name}>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                touch();
              }}
              className={fieldCls(fieldErrors.name)}
            />
          </Field>
          <Field label="Email" error={fieldErrors.email}>
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                touch();
              }}
              className={fieldCls(fieldErrors.email)}
            />
          </Field>
          <Field label="Headline" error={fieldErrors.headline}>
            <input
              value={headline}
              onChange={(e) => {
                setHeadline(e.target.value);
                touch();
              }}
              className={fieldCls(fieldErrors.headline)}
            />
          </Field>
          <Field label="Location" error={fieldErrors.location}>
            <input
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                touch();
              }}
              className={fieldCls(fieldErrors.location)}
            />
          </Field>
        </div>

        <Field label="Avatar URL" error={fieldErrors.avatar_url}>
          <div className="flex gap-2">
            <input
              value={avatarUrl}
              onChange={(e) => {
                setAvatarUrl(e.target.value);
                touch();
              }}
              placeholder="https://…"
              className={fieldCls(fieldErrors.avatar_url)}
            />
            <button
              type="button"
              onClick={() => setPickingAvatar(true)}
              className="shrink-0 border-2 border-ink bg-paper px-3 font-display text-xs font-bold uppercase hover:bg-accent"
            >
              Pick
            </button>
          </div>
        </Field>

        <Field label="Resume URL" error={fieldErrors.resume_url}>
          <input
            value={resumeUrl}
            onChange={(e) => {
              setResumeUrl(e.target.value);
              touch();
            }}
            placeholder="https://… (or leave blank to use the R2 resume)"
            className={fieldCls(fieldErrors.resume_url)}
          />
        </Field>

        <Field label="Bio (markdown)" error={fieldErrors.bio}>
          <textarea
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              touch();
            }}
            rows={8}
            className="w-full resize-y border-2 border-ink bg-paper-2 px-3 py-2 font-mono text-sm leading-relaxed outline-none focus:border-accent"
          />
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="border-2 border-ink bg-accent px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide shadow-brut transition-transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>

      <ImagePicker
        open={pickingAvatar}
        onClose={() => setPickingAvatar(false)}
        onSelect={(url) => {
          setAvatarUrl(url);
          touch();
          setPickingAvatar(false);
        }}
      />
    </div>
  );
}

function Field({
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
    "w-full border-2 border-ink bg-paper-2 px-3 py-2 font-mono text-sm outline-none focus:border-accent",
    error && "border-accent-2",
  );
}
