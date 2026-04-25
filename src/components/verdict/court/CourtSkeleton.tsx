"use client";

import type { ReactNode } from "react";

export function CourtSkeleton({
  verdictNumber,
  children,
}: {
  verdictNumber: string;
  children: ReactNode;
}) {
  return (
    <div className="relative mx-auto w-full max-w-5xl overflow-hidden border border-devil-gold bg-devil-bg-soft/96 px-6 py-10 shadow-[0_0_100px_rgba(139,0,0,0.14)] sm:px-10">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <svg className="h-full w-full" fill="none" viewBox="0 0 1200 900">
          <path
            d="M200 720h800M350 720V380M850 720V380M420 320h360M600 130v160M520 290l-110 90-80 180h160l-80-180M680 290l110 90 80 180H710l80-180"
            stroke="rgba(184,134,11,0.28)"
          />
          <path d="M260 760h680M320 800h560" stroke="rgba(184,134,11,0.16)" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <svg className="size-12 text-devil-gold" fill="none" viewBox="0 0 64 64">
          <path
            d="M32 8v44M16 20h32M32 14 17 20 8 40h18l-9-20M32 14 47 20l-9 20h18l-9-20M22 52h20M26 58h12"
            stroke="currentColor"
          />
        </svg>
        <p className="mt-5 text-center font-mono text-[0.65rem] uppercase tracking-[0.3em] text-devil-gold">
          JUDICIAL RULING · CASE NO. {verdictNumber}
        </p>
      </div>

      <div className="relative z-10 my-6 h-px bg-gradient-to-r from-transparent via-devil-gold/60 to-transparent" />

      <section className="relative z-10 text-center">
        <h1 className="font-display text-[44px] leading-none text-devil-ivory">JUDICIAL RULING</h1>
        <p className="mt-2 font-serif-cn text-lg text-devil-ivory/80">法官最终宣判</p>
      </section>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
