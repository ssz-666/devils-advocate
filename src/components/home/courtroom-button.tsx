"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CourtroomButtonProps = {
  className?: string;
  children?: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function CourtroomButton({
  className,
  children = "进入审判席",
  href = "#trial",
  onClick,
}: CourtroomButtonProps) {
  return (
    <motion.a
      className={cn(
        "quill-cursor courtroom-lines group relative inline-flex overflow-hidden px-7 py-5 font-mono text-[0.68rem] uppercase tracking-[0.28em] text-devil-ivory",
        "transition-colors duration-500 hover:text-devil-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-devil-gold/60",
        className,
      )}
      href={href}
      onClick={onClick}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="absolute inset-y-0 left-0 w-0 bg-devil-red transition-all duration-700 ease-out group-hover:w-full" />
      <span className="relative z-10 flex items-center gap-4">
        {children}
        <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
      </span>
    </motion.a>
  );
}
