"use client";

import Image from "next/image";
import { useState } from "react";

export function HeroAvatar({ src, name }: { src: string; name: string }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = Boolean(src) && !src.includes("example.com") && !imgError;

  return (
    <div className="relative h-40 w-40 shrink-0 md:h-60 md:w-60">
      <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] rounded-full bg-ink" />
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[3px] border-ink bg-paper-2">
        {hasImage ? (
          <Image
            src={src}
            alt={name}
            fill
            sizes="(min-width: 768px) 240px, 160px"
            className="object-cover"
            priority
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted-brut">
            [avatar]
          </span>
        )}
      </div>
    </div>
  );
}
