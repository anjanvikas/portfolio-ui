import Link from "next/link";

// AVK monogram slab. Chartreuse fill, ink border + brut shadow. Doubles as
// the home link.
export function Logo() {
  return (
    <Link
      href="/"
      aria-label="Anjan Vikas Reddy — home"
      className="inline-flex h-10 w-12 items-center justify-center border-2 border-ink-fixed bg-accent font-display text-sm font-bold tracking-wider text-ink-fixed shadow-brut-fixed transition-[transform,box-shadow] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-fixed-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-fixed-press"
    >
      AVK
    </Link>
  );
}
