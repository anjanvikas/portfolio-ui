"use client";

import Image from "next/image";
import { useState } from "react";

export function ProfilePhoto({ src, name }: { src: string; name: string }) {
  const [imgError, setImgError] = useState(false);
  const hasImage = Boolean(src) && !src.includes("example.com") && !imgError;

  return (
    <div className="relative h-56 w-56 shrink-0 md:h-64 md:w-64">
      <div className="absolute inset-0 translate-x-[8px] translate-y-[8px] bg-accent" />
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden border-[3px] border-ink bg-paper-2">
        {hasImage ? (
          <Image
            src={src}
            alt={name}
            fill
            sizes="(min-width: 768px) 256px, 224px"
            className="object-cover"
            priority
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted-brut">
            [photo]
          </span>
        )}
      </div>
    </div>
  );
}
