import Link from "next/link";
import { ArrowDown } from "lucide-react";

import { browserAPIBase, type Profile, type SocialLink } from "@/lib/api";
import { HeroAvatar } from "@/components/site/hero-avatar";

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
          <HeroAvatar src={profile.avatar_url} name={profile.name} />

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
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border-2 border-ink-fixed bg-accent px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-ink-fixed shadow-brut-fixed transition-[transform,box-shadow] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-fixed-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-fixed-press md:px-7"
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
            className="inline-flex items-center justify-center border-2 border-ink bg-paper px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-ink shadow-brut transition-[transform,box-shadow,background-color] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-accent hover:text-ink-fixed hover:shadow-brut-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-press md:px-7"
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
