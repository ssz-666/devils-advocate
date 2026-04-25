"use client";

import { motion } from "framer-motion";

type QuoteDisplayProps = {
  state: "pending" | "streaming" | "ready";
  en: string;
  zh: string;
  progressText: string;
};

export function QuoteDisplay({ state, en, zh, progressText }: QuoteDisplayProps) {
  if (state === "pending") {
    return (
      <div className="mt-12 text-center">
        <div className="mx-auto h-5 w-4/5 animate-pulse bg-devil-line/50" />
        <div className="mx-auto mt-4 h-5 w-3/5 animate-pulse bg-devil-line/40" />
        <div className="mx-auto mt-6 h-4 w-2/3 animate-pulse bg-devil-line/30" />
        <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-devil-muted">
          {progressText}
        </p>
      </div>
    );
  }

  return (
    <motion.section
      animate={{ opacity: 1, filter: "blur(0px)" }}
      className="mt-12 text-center"
      initial={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <p className="font-display text-[28px] leading-tight text-devil-ivory">“{en}”</p>
      <p className="mt-4 font-body-cn text-base leading-8 text-devil-muted">{zh}</p>
      {state === "streaming" ? (
        <div className="mt-5 flex items-center justify-center gap-2">
          <motion.span
            animate={{ opacity: [0.25, 1, 0.25] }}
            className="size-2 rounded-full bg-devil-red"
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-devil-muted">
            Writing verdict...
          </span>
        </div>
      ) : null}
    </motion.section>
  );
}
