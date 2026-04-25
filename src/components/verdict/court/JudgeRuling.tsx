"use client";

import { motion } from "framer-motion";
import type { CourtSentence } from "@/lib/verdict/courtVerdictTemplates";

export function JudgeRuling({
  state,
  sentence,
}: {
  state: "pending" | "ready";
  sentence: CourtSentence;
}) {
  if (state === "pending") {
    return (
      <div className="mt-10 space-y-4">
        <div className="h-5 w-1/3 animate-pulse bg-devil-line/50" />
        <div className="h-5 w-full animate-pulse bg-devil-line/40" />
        <div className="h-5 w-4/5 animate-pulse bg-devil-line/35" />
        <div className="h-7 w-3/4 animate-pulse bg-devil-line/45" />
        <div className="h-5 w-5/6 animate-pulse bg-devil-line/30" />
      </div>
    );
  }

  const rows = [
    { en: sentence.gavelLine, zh: sentence.gavelLineZh },
    { en: sentence.recital, zh: sentence.recitalZh },
    { en: sentence.ruling, zh: sentence.rulingZh },
    { en: sentence.admonition, zh: sentence.admonitionZh },
  ];

  return (
    <section className="mt-10 space-y-7">
      {rows.map((row, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          key={`${row.en}-${index}`}
          transition={{ delay: index * 0.3, duration: 0.45 }}
        >
          <p className={`font-display text-devil-ivory ${index === 2 ? "text-[32px]" : "text-[24px]"} leading-tight`}>
            {row.en}
          </p>
          <p className="mt-3 font-body-cn text-base leading-8 text-devil-muted">{row.zh}</p>
        </motion.div>
      ))}
    </section>
  );
}
