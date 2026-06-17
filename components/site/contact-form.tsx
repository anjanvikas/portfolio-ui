"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { submitContact, type ContactInput } from "@/lib/api";

type Field = keyof ContactInput;
type Errors = Partial<Record<Field, string>>;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Client-side validation mirrors the backend so the user gets instant inline
// feedback; the server re-validates and is the source of truth.
function validate(values: ContactInput): Errors {
  const e: Errors = {};
  if (!values.name.trim()) e.name = "Name is required.";
  if (!values.email.trim()) e.email = "Email is required.";
  else if (!EMAIL_RE.test(values.email.trim()))
    e.email = "Enter a valid email address.";
  if (!values.message.trim()) e.message = "Message is required.";
  return e;
}

const EMPTY: ContactInput = { name: "", email: "", message: "" };

export function ContactForm() {
  const [values, setValues] = useState<ContactInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  function update(field: Field, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    // Clear a field's error as soon as the user edits it.
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const trimmed: ContactInput = {
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
    };
    const found = validate(trimmed);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setPending(true);
    const result = await submitContact(trimmed);
    setPending(false);

    if (result.ok) {
      setSent(true);
      setValues(EMPTY);
      setErrors({});
      return;
    }
    if (result.fieldErrors) setErrors(result.fieldErrors as Errors);
    setFormError(result.error ?? "Something went wrong. Please try again.");
  }

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-4 border-2 border-ink-fixed bg-accent p-8 shadow-brut-fixed"
      >
        <CheckCircle2 strokeWidth={2.5} className="h-8 w-8 text-ink-fixed" />
        <p className="font-display text-2xl font-bold text-ink-fixed">Message sent!</p>
        <p className="font-body text-base text-ink-fixed/80">
          Thanks for reaching out — I&apos;ll get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-2 font-mono text-xs font-bold uppercase tracking-wider text-ink-fixed underline underline-offset-4 hover:no-underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <Field
        id="name"
        label="Name"
        value={values.name}
        error={errors.name}
        onChange={(v) => update("name", v)}
        autoComplete="name"
      />
      <Field
        id="email"
        label="Email"
        type="email"
        value={values.email}
        error={errors.email}
        onChange={(v) => update("email", v)}
        autoComplete="email"
      />
      <Field
        id="message"
        label="Message"
        multiline
        value={values.message}
        error={errors.message}
        onChange={(v) => update("message", v)}
      />

      {formError ? (
        <p role="alert" className="font-mono text-sm font-bold text-accent-2">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 self-start border-2 border-ink-fixed bg-accent px-7 py-3 font-display text-sm font-bold uppercase tracking-wider text-ink-fixed shadow-brut-fixed transition-[transform,box-shadow] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-fixed-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-fixed-press disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send message"}
        {!pending ? <ArrowRight strokeWidth={2.5} className="h-4 w-4" /> : null}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  error,
  onChange,
  type = "text",
  multiline = false,
  autoComplete,
}: {
  id: Field;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
  multiline?: boolean;
  autoComplete?: string;
}) {
  const base =
    "w-full border-2 bg-paper px-4 py-3 font-body text-base text-ink placeholder:text-muted-brut focus:outline-none focus:shadow-brut transition-shadow";
  const borderColor = error ? "border-accent-2" : "border-ink";
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-ink"
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={id}
          rows={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${base} ${borderColor} resize-y`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${base} ${borderColor}`}
        />
      )}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="font-mono text-xs font-bold text-accent-2"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
