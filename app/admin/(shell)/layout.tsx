"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LogOut, PanelLeft, PanelLeftClose } from "lucide-react";

import { cn } from "@/lib/utils";
import { ADMIN_NAV, isAdminActive } from "./admin-nav";

// The admin shell wraps every authenticated admin page (the login page lives
// outside this route group, so it never gets the sidebar). It is a client
// component: the data on the pages it wraps is fetched client-side with the
// JWT cookie, never server-rendered (SCRUM-65). The collapse state lives here
// so it survives navigation between admin pages (Next preserves layouts).
//
// Responsive behaviour:
// - mobile (<md): icon-only rail, labels always hidden
// - desktop (md+): full sidebar with labels, plus a manual collapse toggle
//   that drops it back to the icon-only rail
export default function AdminShellLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function onSignOut() {
    setSigningOut(true);
    try {
      // Clears the httpOnly cookie (and best-effort tells the Go API). We
      // redirect regardless so the user can never get stuck in the shell.
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  // A label is visible only at md+ AND when not collapsed — the single rule
  // that drives both the mobile icon-only rail and the desktop collapse.
  const labelCls = cn(
    "truncate font-display text-sm font-medium uppercase tracking-wider",
    collapsed ? "hidden" : "hidden md:inline",
  );

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <aside
        className={cn(
          "sticky top-0 flex h-screen shrink-0 flex-col border-r-2 border-ink bg-ink text-paper transition-[width] duration-150",
          collapsed ? "w-16" : "w-16 md:w-60",
        )}
      >
        {/* Header: brand + logout */}
        <div className="flex h-14 items-center gap-2 border-b-2 border-paper/20 px-3 md:h-16">
          <span
            className={cn(
              "font-display text-base font-bold uppercase tracking-widest",
              collapsed ? "hidden" : "hidden md:inline",
            )}
          >
            Admin
          </span>
          <button
            type="button"
            onClick={onSignOut}
            disabled={signingOut}
            aria-label="Sign out"
            title="Sign out"
            className="ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center border-2 border-accent-2 text-accent-2 transition-colors hover:bg-accent-2 hover:text-ink disabled:opacity-60"
          >
            <LogOut strokeWidth={2.5} className="h-4 w-4" />
          </button>
        </div>

        {/* Primary nav */}
        <nav aria-label="Admin sections" className="flex flex-1 flex-col gap-1 p-2">
          {ADMIN_NAV.map((item) => {
            const active = isAdminActive(item.href, pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={item.label}
                className={cn(
                  "flex items-center gap-3 border-2 px-2.5 py-2 transition-colors",
                  active
                    ? "border-accent bg-accent text-ink"
                    : "border-transparent text-paper hover:border-paper/30 hover:bg-paper/10",
                )}
              >
                <Icon strokeWidth={2.5} className="h-5 w-5 shrink-0" />
                <span className={labelCls}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle — desktop only (mobile is always icon-only) */}
        <div className="hidden border-t-2 border-paper/20 p-2 md:block">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            className="flex w-full items-center gap-3 border-2 border-transparent px-2.5 py-2 text-paper transition-colors hover:border-paper/30 hover:bg-paper/10"
          >
            {collapsed ? (
              <PanelLeft strokeWidth={2.5} className="h-5 w-5 shrink-0" />
            ) : (
              <PanelLeftClose strokeWidth={2.5} className="h-5 w-5 shrink-0" />
            )}
            <span
              className={cn(
                "font-display text-sm font-medium uppercase tracking-wider",
                collapsed ? "hidden" : "inline",
              )}
            >
              Collapse
            </span>
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
