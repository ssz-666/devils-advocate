"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type StaggeredTitleProps = {
  lines: Array<{
    text: string;
    className?: string;
  }>;
};

const container: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.18,
    },
  },
};

const character: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

export function StaggeredTitle({ lines }: StaggeredTitleProps) {
  return (
    <motion.h1
      className="font-serif-cn text-[clamp(3rem,9vw,7.5rem)] leading-[0.98] tracking-[-0.06em] text-devil-ivory"
      initial="hidden"
      animate="visible"
      variants={container}
    >
      {lines.map((line) => (
        <span className={cn("block", line.className)} key={line.text}>
          {Array.from(line.text).map((char, index) => (
            <motion.span
              aria-hidden="true"
              className="inline-block"
              key={`${line.text}-${char}-${index}`}
              variants={character}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
          <span className="sr-only">{line.text}</span>
        </span>
      ))}
    </motion.h1>
  );
}
