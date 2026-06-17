"use client";

import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTheme } from "./theme-provider";

// Light/dark toggle slab. Moon in light, Sun in dark — matches the S042 dark
// frame spec. The theme comes from useSyncExternalStore (reads the live `.dark`
// class), so the server renders the light icon and React corrects it on the
// client without a hydration-mismatch warning.
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center border-2 border-ink bg-paper text-ink shadow-brut transition-[transform,box-shadow,background-color] duration-100 hover:bg-accent hover:text-ink-fixed active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-press md:h-10 md:w-10",
        className,
      )}
    >
      {isDark ? (
        <Sun strokeWidth={2.5} className="h-5 w-5" />
      ) : (
        <Moon strokeWidth={2.5} className="h-5 w-5" />
      )}
    </button>
  );
}
