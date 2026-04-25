"use client";

import { motion } from "framer-motion";
import { FURIES_TEMPLATE } from "@/lib/verdict/furiesTemplate";

export function ConvergenceDivergence({
  state,
  convergence,
  divergence,
  progressText,
}: {
  state: "pending" | "ready";
  convergence: string;
  divergence: string;
  progressText: string;
}) {
  if (state === "pending") {
    return (
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="space-y-3 border border-devil-line bg-devil-bg/45 p-5">
          <div className="h-4 w-40 animate-pulse bg-devil-line/60" />
          <div className="h-5 w-full animate-pulse bg-devil-line/45" />
          <div className="h-5 w-4/5 animate-pulse bg-devil-line/35" />
        </div>
        <div className="space-y-3 border border-devil-line bg-devil-bg/45 p-5">
          <div className="h-4 w-40 animate-pulse bg-devil-line/60" />
          <div className="h-5 w-full animate-pulse bg-devil-line/45" />
          <div className="h-5 w-4/5 animate-pulse bg-devil-line/35" />
        </div>
        <p className="sm:col-span-2 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-devil-muted">
          {progressText}
        </p>
      </div>
    );
  }

  return (
    <motion.section
      animate={{ opacity: 1, filter: "blur(0px)" }}
      className="mt-10 grid gap-6 sm:grid-cols-2"
      initial={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.4 }}
    >
      <article className="border border-devil-gold/35 bg-devil-bg/45 p-5">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-devil-gold">
          {FURIES_TEMPLATE.convergenceLabel}
        </p>
        <p className="mt-2 font-serif-cn text-base text-devil-ivory/70">
          {FURIES_TEMPLATE.convergenceLabelZh}
        </p>
        <p className="mt-5 font-body-cn text-base leading-8 text-devil-ivory">{convergence}</p>
      </article>
      <article className="border border-devil-red/35 bg-devil-bg/45 p-5">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-devil-red">
          {FURIES_TEMPLATE.divergenceLabel}
        </p>
        <p className="mt-2 font-serif-cn text-base text-devil-ivory/70">
          {FURIES_TEMPLATE.divergenceLabelZh}
        </p>
        <p className="mt-5 font-body-cn text-base leading-8 text-devil-ivory">{divergence}</p>
      </article>
    </motion.section>
  );
}
