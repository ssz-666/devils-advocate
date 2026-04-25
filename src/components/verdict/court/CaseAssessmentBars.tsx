"use client";

import { motion } from "framer-motion";

type Breakdown = {
  prosecutionStrength: number;
  defenseStrength: number;
  evidenceClarity: number;
};

const labels = [
  { key: "prosecutionStrength", label: "PROSECUTION", zh: "控方强度", color: "#8B0000" },
  { key: "defenseStrength", label: "DEFENSE", zh: "辩方强度", color: "#B8860B" },
  { key: "evidenceClarity", label: "EVIDENCE", zh: "证据清晰度", color: "#E8E6E3" },
] as const;

export function CaseAssessmentBars({
  state,
  breakdown,
}: {
  state: "pending" | "ready";
  breakdown: Breakdown;
}) {
  if (state === "pending") {
    return (
      <div className="mt-10 space-y-5">
        {labels.map((item) => (
          <div className="space-y-2" key={item.key}>
            <div className="h-3 w-44 animate-pulse bg-devil-line/55" />
            <div className="h-3 w-full animate-pulse bg-devil-line/35" />
          </div>
        ))}
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-devil-muted">
          Deliberating...
        </p>
      </div>
    );
  }

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="mt-10 space-y-5"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
    >
      {labels.map((item) => {
        const value = breakdown[item.key];
        return (
          <div key={item.key}>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em]" style={{ color: item.color }}>
                {item.label}
              </p>
              <p className="font-serif-cn text-sm text-devil-muted">{item.zh}</p>
            </div>
            <div className="h-3 overflow-hidden bg-devil-line/35">
              <motion.div
                animate={{ width: `${value}%` }}
                className="h-full"
                initial={{ width: 0 }}
                style={{ backgroundColor: item.color }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </div>
          </div>
        );
      })}
    </motion.section>
  );
}
