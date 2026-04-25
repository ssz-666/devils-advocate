"use client";

import { motion } from "framer-motion";

export function JudicialCommentary({
  state,
  en,
  zh,
}: {
  state: "hidden" | "pending" | "streaming" | "ready";
  en: string;
  zh: string;
}) {
  if (state === "hidden") {
    return null;
  }

  if (state === "pending") {
    return (
      <div className="mt-10 border border-devil-line bg-devil-bg/45 px-5 py-5">
        <div className="h-4 w-44 animate-pulse bg-devil-line/50" />
      </div>
    );
  }

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="mt-10 border border-devil-line bg-devil-bg/45 px-5 py-5"
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.4 }}
    >
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-devil-gold">
        Judicial Commentary
      </p>
      <p className="mt-4 font-display text-[24px] leading-tight text-devil-ivory">{en}</p>
      <p className="mt-3 font-body-cn text-base leading-8 text-devil-muted">{zh}</p>
      {state === "streaming" ? (
        <div className="mt-4 flex items-center gap-2">
          <motion.span
            animate={{ opacity: [0.25, 1, 0.25] }}
            className="size-2 rounded-full bg-devil-red"
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-devil-muted">
            Writing commentary...
          </span>
        </div>
      ) : null}
    </motion.section>
  );
}
