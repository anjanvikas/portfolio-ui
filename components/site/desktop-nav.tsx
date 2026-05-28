"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { NAV_LINKS, isActive } from "./nav-links";

// Inline link row shown at md+. Active route gets a 3px chartreuse underline
// drawn as a bottom border — no font-weight swap (causes layout shift).
export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="hidden items-center gap-8 md:flex"
    >
      {NAV_LINKS.map((link) => {
        const active = isActive(link.href, pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "font-display text-sm font-medium uppercase tracking-wider text-ink transition-colors duration-100 hover:text-ink/80",
              // Reserve 3px of bottom border on every link so the active state
              // never nudges siblings vertically.
              "border-b-[3px] pb-1",
              active ? "border-accent" : "border-transparent",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
