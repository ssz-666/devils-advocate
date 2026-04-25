"use client";

import type { ReactNode } from "react";
import { FURIES_TEMPLATE } from "@/lib/verdict/furiesTemplate";

export function FuriesSkeleton({
  verdictNumber,
  children,
}: {
  verdictNumber: string;
  children: ReactNode;
}) {
  return (
    <div className="relative mx-auto w-full max-w-6xl border border-devil-gold bg-devil-bg-soft/95 px-6 py-10 shadow-[0_0_100px_rgba(139,0,0,0.14)] sm:px-10">
      <div className="flex flex-col items-center">
        <svg className="size-12 text-devil-gold" fill="none" viewBox="0 0 64 64">
          <path
            d="M32 8v44M16 20h32M32 14 17 20 8 40h18l-9-20M32 14 47 20l-9 20h18l-9-20M22 52h20M26 58h12"
            stroke="currentColor"
          />
        </svg>
        <p className="mt-5 text-center font-mono text-[0.65rem] uppercase tracking-[0.3em] text-devil-gold">
          {FURIES_TEMPLATE.subheader} · REPORT NO. {verdictNumber}
        </p>
      </div>

      <div className="my-6 h-px bg-gradient-to-r from-transparent via-devil-gold/60 to-transparent" />

      <section className="text-center">
        <h1 className="font-display text-[42px] leading-none text-devil-ivory">
          {FURIES_TEMPLATE.reportTitle}
        </h1>
        <p className="mt-2 font-serif-cn text-lg text-devil-ivory/80">
          {FURIES_TEMPLATE.reportTitleZh}
        </p>
        <p className="mt-5 font-body-cn text-sm leading-7 text-devil-muted">
          {FURIES_TEMPLATE.panelOpeningZh}
        </p>
      </section>

      {children}
    </div>
  );
}
