"use client";

import type { ReactNode } from "react";

type VerdictSkeletonProps = {
  verdictNumber: string;
  children: ReactNode;
};

export function VerdictSkeleton({ verdictNumber, children }: VerdictSkeletonProps) {
  return (
    <div className="relative mx-auto w-full max-w-[560px] border border-devil-gold bg-devil-bg-soft/95 px-6 py-10 shadow-[0_0_100px_rgba(139,0,0,0.14)] sm:px-[60px]">
      <div className="flex flex-col items-center">
        <svg className="size-12 text-devil-gold" fill="none" viewBox="0 0 64 64">
          <path
            d="M32 8v44M16 20h32M32 14 17 20 8 40h18l-9-20M32 14 47 20l-9 20h18l-9-20M22 52h20M26 58h12"
            stroke="currentColor"
          />
        </svg>
        <p className="mt-5 text-center font-mono text-[0.65rem] uppercase tracking-[0.3em] text-devil-gold">
          COURT OF COGNITIVE CLARITY · VERDICT NO. {verdictNumber}
        </p>
      </div>

      <div className="my-6 h-px bg-gradient-to-r from-transparent via-devil-gold/60 to-transparent" />

      <section>
        <h1 className="text-center font-display text-[44px] leading-none text-devil-ivory">
          The Verdict
        </h1>
        <p className="mt-2 text-center font-serif-cn text-lg text-devil-ivory/80">判决如下</p>
      </section>

      {children}

      <section className="mt-12 flex items-end justify-between gap-4">
        <div className="rounded-full border border-devil-red/35 px-4 py-2 font-body-cn text-sm text-devil-muted">
          Docket prepared
        </div>
        <div className="flex items-end gap-3">
          <svg className="size-12 text-devil-red/45" fill="none" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="28" stroke="currentColor" />
            <path
              d="M24 42c8-10 24-12 32 0M29 31c8 5 14 5 22 0M31 50c7 4 11 4 18 0"
              stroke="currentColor"
            />
          </svg>
          <div className="text-right">
            <p className="font-body-cn text-sm text-devil-muted">Ink is already on the desk.</p>
            <p className="mt-2 font-display text-2xl text-devil-red">
              — The Devil&apos;s Advocate
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
