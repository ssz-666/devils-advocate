"use client";

import { motion } from "framer-motion";

type VerdictTemplateProps = {
  state: "pending" | "ready";
  opening: string;
  openingZh: string;
  closing: string;
  closingZh: string;
};

export function VerdictTemplate({
  state,
  opening,
  openingZh,
  closing,
  closingZh,
}: VerdictTemplateProps) {
  if (state === "pending") {
    return (
      <div className="mt-10 space-y-4">
        <div className="h-5 w-4/5 animate-pulse bg-devil-line/50" />
        <div className="h-5 w-3/5 animate-pulse bg-devil-line/40" />
        <div className="mt-8 h-5 w-4/5 animate-pulse bg-devil-line/35" />
        <div className="h-5 w-2/3 animate-pulse bg-devil-line/30" />
      </div>
    );
  }

  return (
    <motion.section
      animate={{ opacity: 1, filter: "blur(0px)" }}
      className="mt-10 text-center"
      initial={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <p className="font-display text-[24px] leading-tight text-devil-ivory">{opening}</p>
      <p className="mt-4 font-body-cn text-base leading-8 text-devil-muted">{openingZh}</p>
      <p className="mt-8 font-display text-[24px] leading-tight text-devil-ivory">{closing}</p>
      <p className="mt-4 font-body-cn text-base leading-8 text-devil-muted">{closingZh}</p>
    </motion.section>
  );
}
