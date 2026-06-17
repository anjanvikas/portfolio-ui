"use client";

import { useCallback, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

// Hand-rolled theme "provider" (next-themes isn't installed; the CSS token swap
// already lives in globals.css under `.dark`). The single source of truth is the
// `.dark` class on <html> — set before first paint by the inline script in
// app/layout.tsx. This module is just the JS layer that reads, flips, and
// persists that class. We expose it via useSyncExternalStore so React reads the
// live DOM state without an effect-driven setState (and without hydration
// mismatch: the server snapshot is always "light", matching the SSR HTML).

const listeners = new Set<() => void>();
let initialized = false;

function emit() {
  for (const listener of listeners) listener();
}

// Wire global listeners once, lazily (guarded for SSR where window is absent).
function ensureGlobalListeners() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // Follow the OS preference, but only while the user hasn't chosen explicitly.
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(STORAGE_KEY);
      } catch {
        stored = null;
      }
      if (!stored) {
        document.documentElement.classList.toggle("dark", event.matches);
        emit();
      }
    });

  // Keep other tabs in sync when the choice changes.
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    document.documentElement.classList.toggle("dark", event.newValue === "dark");
    emit();
  });
}

function subscribe(callback: () => void) {
  ensureGlobalListeners();
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

// Apply + persist an explicit user choice (overrides the OS default).
export function setTheme(next: Theme) {
  document.documentElement.classList.toggle("dark", next === "dark");
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // private mode / storage disabled — theme still applies for the session
  }
  emit();
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);
  return { theme, toggle, setTheme };
}
