"use client";

import { motion } from "framer-motion";

export function FinalStatement({
  en,
  zh,
}: {
  en: string;
  zh: string;
}) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="mt-10 border border-devil-gold/35 bg-devil-bg/45 px-6 py-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.45 }}
    >
      <p className="font-display text-[28px] leading-tight text-devil-ivory">“{en}”</p>
      <p className="mx-auto mt-4 max-w-3xl font-body-cn text-base leading-8 text-devil-muted">
        {zh}
      </p>
    </motion.section>
  );
}
