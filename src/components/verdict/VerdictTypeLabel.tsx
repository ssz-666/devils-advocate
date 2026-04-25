"use client";

import { motion } from "framer-motion";
import type { VerdictType } from "@/lib/verdict/templates";

type VerdictTypeLabelProps = {
  state: "pending" | "ready";
  verdictType: VerdictType | null;
  label: string;
  labelZh: string;
};

export function VerdictTypeLabel({
  state,
  verdictType,
  label,
  labelZh,
}: VerdictTypeLabelProps) {
  if (state === "pending" || !verdictType) {
    return (
      <div className="mx-auto mt-10 max-w-xs text-center">
        <div className="mx-auto h-6 w-36 animate-pulse bg-devil-line/50" />
        <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-devil-muted">
          Awaiting ruling...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, filter: "blur(0px)" }}
      className="mx-auto mt-10 text-center"
      initial={{ opacity: 0, filter: "blur(8px)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-devil-gold">
        {label}
      </p>
      <p className="mt-2 font-serif-cn text-base text-devil-ivory/85">{labelZh}</p>
    </motion.div>
  );
}
