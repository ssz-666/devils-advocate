"use client";

import { motion } from "framer-motion";

export function KineticScale() {
  return (
    <motion.svg
      aria-hidden="true"
      className="absolute bottom-8 right-6 hidden h-28 w-28 text-devil-gold/25 sm:block lg:bottom-12 lg:right-14 lg:h-40 lg:w-40"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1"
      viewBox="0 0 120 120"
      animate={{ rotate: [-4, 4, -4] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M60 14v82" />
      <path d="M32 36h56" />
      <path d="M60 24 34 36l-16 34h32L34 36" />
      <path d="M60 24 86 36l-16 34h32L86 36" />
      <path d="M44 96h32" />
      <path d="M52 106h16" />
    </motion.svg>
  );
}
