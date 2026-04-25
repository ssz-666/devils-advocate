"use client";

import { motion } from "framer-motion";

export function QuestionSummary({
  summary,
}: {
  summary: string;
}) {
  return (
    <motion.section
      animate={{ opacity: 1, filter: "blur(0px)" }}
      className="mt-8 border border-devil-line bg-devil-bg/35 px-6 py-5 text-center"
      initial={{ opacity: 0, filter: "blur(8px)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <p className="font-mono text-[0.66rem] uppercase tracking-[0.3em] text-devil-gold">
        QUESTION SUMMARY · 问题概括
      </p>
      <p className="mt-4 font-serif-cn text-lg leading-8 text-devil-ivory/88">{summary}</p>
    </motion.section>
  );
}
