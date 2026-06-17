import { DesktopNav } from "./desktop-nav";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";

// Sticky site-wide navbar slab. Desktop = inline link row; mobile = hamburger
// that opens a slide-down drawer. The theme toggle lives in the header rail so
// it's reachable on both desktop and mobile (SCRUM-88).
export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-paper">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 md:h-16 md:px-6">
        <Logo />
        <DesktopNav />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
