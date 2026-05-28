import { Moon } from "lucide-react";

import { DesktopNav } from "./desktop-nav";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";

// Sticky site-wide navbar slab. Desktop = inline link row; mobile = hamburger
// that opens a slide-down drawer. Theme toggle is a non-functional placeholder
// for now (dark-mode swap is not in SCRUM-59 scope).
export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-paper">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 md:h-16 md:px-6">
        <Logo />
        <DesktopNav />
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Toggle theme (coming soon)"
            disabled
            className="hidden h-10 w-10 items-center justify-center border-2 border-ink bg-paper text-ink shadow-brut transition-[transform,box-shadow] duration-100 disabled:cursor-not-allowed disabled:opacity-60 md:inline-flex"
          >
            <Moon strokeWidth={2.5} className="h-5 w-5" />
          </button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
