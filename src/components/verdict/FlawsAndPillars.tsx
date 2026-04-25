"use client";

import { motion } from "framer-motion";
import { AlertTriangle, BadgeCheck, Sparkles } from "lucide-react";

type FlawsAndPillarsProps = {
  state: "pending" | "ready" | "hidden";
  fatalFlaws: string[];
  solidPillars: string[];
  progressText: string;
};

export function FlawsAndPillars({
  state,
  fatalFlaws,
  solidPillars,
  progressText,
}: FlawsAndPillarsProps) {
  if (state === "hidden") {
    return null;
  }

  if (state === "pending") {
    return (
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="h-4 w-32 animate-pulse bg-devil-line/60" />
          <div className="h-16 animate-pulse bg-devil-line/45" />
          <div className="h-16 animate-pulse bg-devil-line/35" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-32 animate-pulse bg-devil-line/60" />
          <div className="h-16 animate-pulse bg-devil-line/45" />
          <div className="h-16 animate-pulse bg-devil-line/35" />
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
      className="mt-12 grid gap-8 sm:grid-cols-2"
      initial={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div>
        <div className="flex items-center gap-2 text-devil-red">
          <AlertTriangle className="size-4" />
          <h2 className="font-mono text-xs uppercase tracking-[0.26em]">
            Fatal Flaws · 致命漏洞
          </h2>
        </div>
        <div className="mt-4 space-y-3">
          {fatalFlaws.map((item, index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="border-l border-devil-red pl-4"
              initial={{ opacity: 0, y: 12 }}
              key={`${item}-${index}`}
              transition={{ delay: index * 0.15, duration: 0.35 }}
            >
              <div className="flex items-start gap-2">
                <p className="flex-1 font-body-cn text-sm leading-7 text-devil-ivory">{item}</p>
                <span className="mt-1 text-devil-red">
                  <Sparkles className="size-4" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-devil-gold">
          <BadgeCheck className="size-4" />
          <h2 className="font-mono text-xs uppercase tracking-[0.26em]">
            Solid Pillars · 坚固堡垒
          </h2>
        </div>
        <div className="mt-4 space-y-3">
          {solidPillars.map((item, index) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="border-l border-devil-gold pl-4"
              initial={{ opacity: 0, y: 12 }}
              key={`${item}-${index}`}
              transition={{ delay: index * 0.15, duration: 0.35 }}
            >
              <p className="font-body-cn text-sm leading-7 text-devil-ivory">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
