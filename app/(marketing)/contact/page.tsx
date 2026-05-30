import type { Metadata } from "next";

import { ContactForm } from "@/components/site/contact-form";
import { fetchProfile } from "@/lib/api";

export const metadata: Metadata = {
  title: "Contact — Anjan Vikas Reddy",
  description:
    "Get in touch about roles, collaborations, or just to say hello.",
};

export default async function ContactPage() {
  // force-cached profile fetch → this page snapshots at build time, with the
  // form hydrating as a client island.
  const profile = await fetchProfile();

  return (
    <div className="bg-paper">
      <section className="mx-auto max-w-3xl px-5 pt-10 pb-16 md:px-6 md:pt-16 md:pb-24">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-accent-2">
          — Contact
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink md:text-6xl">
          Let&apos;s talk.
        </h1>
        <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-muted-brut md:text-lg">
          Have a role, a project, or a question? Drop a note below and it lands
          straight in my inbox.
          {profile.email ? (
            <>
              {" "}
              Prefer email? Reach me at{" "}
              <a
                href={`mailto:${profile.email}`}
                className="font-semibold text-ink underline decoration-accent decoration-2 underline-offset-4 hover:bg-accent"
              >
                {profile.email}
              </a>
              .
            </>
          ) : null}
        </p>

        <div className="mt-10 md:mt-12">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
