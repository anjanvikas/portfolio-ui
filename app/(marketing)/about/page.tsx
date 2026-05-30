import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDown } from "lucide-react";

import { ExperienceTimeline } from "@/components/site/experience-timeline";
import { MarkdownSection } from "@/components/site/markdown-section";
import { TestimonialsStrip } from "@/components/site/testimonials-strip";
import {
  browserAPIBase,
  fetchExperience,
  fetchProfile,
  fetchTestimonials,
  type Profile,
} from "@/lib/api";

export const metadata: Metadata = {
  title: "About — Anjan Vikas Reddy",
  description:
    "Background, work history, and what people I've worked with have to say.",
};

export default async function AboutPage() {
  // All three feeds are force-cached, so this page snapshots at build time
  // (SCRUM-63 AC: statically generated).
  const [profile, experience, testimonials] = await Promise.all([
    fetchProfile(),
    fetchExperience(),
    fetchTestimonials(),
  ]);

  return (
    <div className="bg-paper">
      {/* Intro — photo + bio */}
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-12 md:px-6 md:pt-16 md:pb-16">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-accent-2">
          — About
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink md:text-6xl">
          {profile.name.replace(/\.$/, "")}.
        </h1>

        <div className="mt-8 flex flex-col gap-8 md:mt-10 md:flex-row md:gap-12">
          <ProfilePhoto src={profile.avatar_url} name={profile.name} />
          <div className="md:flex-1">
            <p className="font-display text-lg font-semibold text-ink md:text-xl">
              {profile.headline}
            </p>
            <MarkdownSection body={profile.bio} />
            <a
              href={`${browserAPIBase()}/api/v1/profile/resume`}
              className="mt-6 inline-flex items-center justify-center gap-2 border-2 border-ink bg-accent px-7 py-3 font-display text-sm font-bold uppercase tracking-wider text-ink shadow-brut transition-[transform,box-shadow] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-press"
            >
              Download CV
              <ArrowDown strokeWidth={2.5} className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Experience timeline */}
      <section className="mx-auto max-w-6xl px-5 py-12 md:px-6 md:py-16">
        <SectionHeading eyebrow="— Experience" title="Where I've worked." />
        <div className="mt-10">
          <ExperienceTimeline entries={experience} />
        </div>
      </section>

      {/* Testimonials strip */}
      {testimonials.length > 0 ? (
        <section className="bg-ink">
          <div className="mx-auto max-w-6xl px-5 py-14 md:px-6 md:py-20">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-accent">
              — Testimonials
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-paper md:text-5xl">
              What people say.
            </h2>
            <div className="mt-10">
              <TestimonialsStrip items={testimonials} />
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-accent-2">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-ink md:text-5xl">
        {title}
      </h2>
    </div>
  );
}

// Square brutalist photo frame — 3px ink border + hard offset shadow, mirroring
// the Hero avatar treatment. Falls back to an [AVATAR] slug while the seed ships
// a placeholder URL (real assets land with R2 in SCRUM-16).
function ProfilePhoto({ src, name }: { src: Profile["avatar_url"]; name: string }) {
  const hasImage = Boolean(src) && !src.includes("example.com");
  return (
    <div className="relative h-56 w-56 shrink-0 md:h-64 md:w-64">
      <div className="absolute inset-0 translate-x-[8px] translate-y-[8px] bg-accent" />
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden border-[3px] border-ink bg-paper-2">
        {hasImage ? (
          <Image
            src={src}
            alt={name}
            fill
            sizes="(min-width: 768px) 256px, 224px"
            className="object-cover"
            priority
          />
        ) : (
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted-brut">
            [photo]
          </span>
        )}
      </div>
    </div>
  );
}
