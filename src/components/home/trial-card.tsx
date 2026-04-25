"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TrialCardProps = {
  cnTitle: string;
  subtitle: string;
  description: string;
  icon: ReactNode;
  href?: string;
};

export function TrialCard({ cnTitle, subtitle, description, icon, href }: TrialCardProps) {
  const card = (
    <motion.article
      className={cn(
        "quill-cursor group relative min-h-72 overflow-hidden border border-devil-line bg-devil-bg-soft/24 p-7",
        "transition-colors duration-500 hover:border-devil-red hover:bg-devil-red/10",
      )}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
      whileHover={{ y: -8 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,0,0,0.22),transparent_45%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <motion.div
        className="relative mb-12 text-devil-gold"
        transition={{ duration: 0.45 }}
        whileHover={{ rotate: -8 }}
      >
        {icon}
      </motion.div>
      <div className="relative">
        <h3 className="font-serif-cn text-3xl text-devil-ivory">{cnTitle}</h3>
        <p className="mt-2 font-serif-cn text-4xl leading-none text-devil-ivory/90">
          {subtitle}
        </p>
        <p className="mt-6 max-w-xs font-body-cn text-sm leading-7 text-devil-muted">
          {description}
        </p>
      </div>
    </motion.article>
  );

  if (!href) {
    return card;
  }

  return (
    <Link aria-label={`进入${cnTitle}模式`} href={href}>
      {card}
    </Link>
  );
}
