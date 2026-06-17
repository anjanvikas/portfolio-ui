import Link from "next/link";

import { fetchProfile, type SocialLink } from "@/lib/api";

// Canonical footer tile order + 2-letter labels. Wireframe: GH LI TW YT LC.
const SOCIAL_TILES: { name: string; label: string }[] = [
  { name: "github", label: "GH" },
  { name: "linkedin", label: "LI" },
  { name: "twitter", label: "TW" },
  { name: "youtube", label: "YT" },
  { name: "leetcode", label: "LC" },
];

const YEAR = 2026;

// Site-wide footer on the chartreuse slab. Copy left + social tiles right on
// desktop; stacked on mobile. Async server component — pulls social links from
// the cached profile fetch (deduped with the homepage's own fetchProfile).
export async function SiteFooter() {
  let links: SocialLink[] = [];
  try {
    links = (await fetchProfile()).social_links;
  } catch {
    // A profile fetch failure shouldn't blow up every page's footer; fall back
    // to copy-only.
    links = [];
  }

  return (
    <footer className="border-t-2 border-ink-fixed bg-accent text-ink-fixed">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="font-display">
          <p className="text-sm font-bold uppercase tracking-wider">
            © {YEAR} Anjan Vikas Reddy
          </p>
          <p className="mt-1 font-body text-sm text-ink-fixed/70">
            Built deliberately. Hosted on Fly + Vercel.
          </p>
        </div>

        {links.length > 0 && (
          <ul className="flex flex-wrap gap-3">
            {SOCIAL_TILES.map((tile) => {
              const link = links.find(
                (l) => l.name.toLowerCase() === tile.name,
              );
              if (!link) return null;
              return (
                <li key={tile.name}>
                  <Link
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={tile.name}
                    className="inline-flex h-11 w-11 items-center justify-center border-2 border-ink-fixed bg-paper-fixed font-mono text-xs font-bold uppercase text-ink-fixed shadow-brut-fixed transition-[transform,box-shadow] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-fixed-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-fixed-press"
                  >
                    {tile.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </footer>
  );
}
