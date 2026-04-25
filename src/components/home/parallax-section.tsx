"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type ParallaxSectionProps = {
  children: ReactNode;
  className?: string;
};

export function ParallaxSection({ children, className }: ParallaxSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [70, -70]);
  const opacity = useTransform(scrollYProgress, [0, 0.22, 0.82, 1], [0, 1, 1, 0.55]);

  return (
    <section ref={ref} className={cn("relative overflow-hidden px-5 py-28 sm:px-8", className)}>
      <motion.div style={{ y, opacity }}>{children}</motion.div>
    </section>
  );
}
