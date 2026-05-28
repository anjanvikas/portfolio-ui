import Image from "next/image";
import Link from "next/link";
import { ArrowDown } from "lucide-react";

import { browserAPIBase, type Profile, type SocialLink } from "@/lib/api";

const HERO_SOCIAL_KEYS = ["github", "linkedin"] as const;

function findSocial(links: SocialLink[], name: string): SocialLink | undefined {
  return links.find((l) => l.name.toLowerCase() === name);
}

// Hero. Side-by-side avatar + text at md+, stacked at <md. Avatar circle has
// a 3px ink border + hard brut shadow. CV button links to the API's resume
// endpoint which 302s to the live PDF URL.
export function Hero({ profile }: { profile: Profile }) {
  const cvHref = `${browserAPIBase()}/api/v1/profile/resume`;

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-5 pt-10 pb-12 md:px-6 md:pt-20 md:pb-24">
        <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:gap-14">
          <Avatar src={profile.avatar_url} name={profile.name} />

          <div className="flex w-full flex-col items-start md:flex-1">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-accent-2">
              — {profile.headline}
            </p>

            <h1 className="mt-4 font-display text-5xl font-bold leading-[1.05] text-ink md:mt-5 md:text-7xl">
              {withTrailingPeriod(profile.name)}
            </h1>

            <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-muted-brut md:mt-7 md:text-lg">
              {profile.bio}
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 md:mt-10 md:w-auto md:flex-row md:items-center md:gap-4">
              <a
                href={cvHref}
                className="inline-flex items-center justify-center gap-2 border-2 border-ink bg-accent px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-ink shadow-brut transition-[transform,box-shadow] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-press md:px-7"
              >
                Download CV
                <ArrowDown strokeWidth={2.5} className="h-4 w-4" />
              </a>
              <HeroSocialButtons links={profile.social_links} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Avatar({ src, name }: { src: string; name: string }) {
  // The seed ships a placeholder URL until real assets land in R2 (SCRUM-16).
  // Detect that case and render the [AVATAR] slug so we don't fire a 404 at
  // next/image.
  const hasImage = Boolean(src) && !src.includes("example.com");
  return (
    <div className="relative h-40 w-40 shrink-0 md:h-60 md:w-60">
      <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] rounded-full bg-ink" />
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[3px] border-ink bg-paper-2">
        {hasImage ? (
          <Image
            src={src}
            alt={name}
            fill
            sizes="(min-width: 768px) 240px, 160px"
            className="object-cover"
            priority
          />
        ) : (
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted-brut">
            [avatar]
          </span>
        )}
      </div>
    </div>
  );
}

function HeroSocialButtons({ links }: { links: SocialLink[] }) {
  return (
    <>
      {HERO_SOCIAL_KEYS.map((key) => {
        const link = findSocial(links, key);
        if (!link) return null;
        return (
          <Link
            key={key}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center border-2 border-ink bg-paper px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-ink shadow-brut transition-[transform,box-shadow,background-color] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-accent hover:shadow-brut-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-press md:px-7"
          >
            {key}
          </Link>
        );
      })}
    </>
  );
}

function withTrailingPeriod(s: string): string {
  return s.endsWith(".") ? s : `${s}.`;
}
