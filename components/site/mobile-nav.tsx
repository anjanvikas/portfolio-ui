"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_LINKS, isActive } from "./nav-links";

// Hamburger that opens a slide-down drawer covering the viewport below the
// navbar. Per /docs/wireframes/responsive.md: full-width slab links, active
// item bg-accent, closes on ✕ / route change / ESC.
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change using React's "reset state when derived value
  // changes" pattern (https://react.dev/learn/you-might-not-need-an-effect).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  // Close on ESC + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-11 w-11 items-center justify-center border-2 border-ink bg-paper text-ink transition-colors duration-100 hover:bg-accent hover:text-ink-fixed active:bg-accent active:text-ink-fixed md:hidden"
      >
        {open ? (
          <X strokeWidth={2.5} className="h-6 w-6" />
        ) : (
          <Menu strokeWidth={2.5} className="h-6 w-6" />
        )}
      </button>

      <div
        id="mobile-nav-drawer"
        hidden={!open}
        className={cn(
          "fixed inset-x-0 top-[57px] z-40 border-y-2 border-ink bg-paper-2 md:hidden",
          // Drawer fills the rest of the viewport below the 56px-tall nav slab
          // (57px includes the 1px ink border at the bottom of the nav).
          "max-h-[calc(100dvh-57px)] overflow-y-auto",
        )}
      >
        <nav className="flex flex-col gap-3 p-5">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block border-2 border-ink px-5 py-4 font-display text-base font-bold uppercase tracking-wide shadow-brut transition-[transform,box-shadow] duration-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-press",
                  active
                    ? "bg-accent text-ink-fixed"
                    : "bg-paper text-ink hover:bg-accent hover:text-ink-fixed",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
