"use client";

import { animate, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { VerdictStatus } from "@/lib/store/debate";

type ConvictionGaugeProps = {
  state: "pending" | "ready";
  score: number;
  verdictType: VerdictStatus;
  progressText: string;
};

function getVerdictTone(score: number) {
  if (score < 40) {
    return {
      color: "#8B0000",
      zh: "决定不成立",
    };
  }

  if (score < 70) {
    return {
      color: "#B8860B",
      zh: "争议未决",
    };
  }

  return {
    color: "#E8E6E3",
    zh: "决定成立",
  };
}

export function ConvictionGauge({
  state,
  score,
  verdictType,
  progressText,
}: ConvictionGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = 110;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;
  const tone = getVerdictTone(score);

  useEffect(() => {
    if (state !== "ready") {
      return;
    }

    const controls = animate(0, score, {
      duration: 2,
      onUpdate: (value) => setDisplayScore(Math.round(value)),
    });

    return () => controls.stop();
  }, [score, state]);

  if (state === "pending") {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          className="grid place-items-center"
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
          <svg className="size-24 text-devil-gold/70" fill="none" viewBox="0 0 64 64">
            <path
              d="M32 8v44M16 20h32M32 14 17 20 8 40h18l-9-20M32 14 47 20l-9 20h18l-9-20M22 52h20M26 58h12"
              stroke="currentColor"
            />
          </svg>
        </motion.div>
        <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-devil-muted">
          {progressText}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, filter: "blur(0px)" }}
      className="flex flex-col items-center"
      initial={{ opacity: 0, filter: "blur(8px)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <svg className="h-52 w-full max-w-[320px]" viewBox="0 0 280 180">
        <path
          d="M30 140a110 110 0 0 1 220 0"
          fill="none"
          stroke="rgba(184,134,11,0.12)"
          strokeLinecap="round"
          strokeWidth="10"
        />
        <motion.path
          animate={{ strokeDashoffset: circumference - progress }}
          d="M30 140a110 110 0 0 1 220 0"
          fill="none"
          initial={{ strokeDashoffset: circumference }}
          stroke={tone.color}
          strokeDasharray={circumference}
          strokeLinecap="round"
          strokeWidth="10"
          transition={{ duration: 2, ease: "easeOut" }}
        />
      </svg>
      <div className="-mt-10 text-center">
        <p className="font-display text-7xl leading-none" style={{ color: tone.color }}>
          {displayScore}
        </p>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.32em] text-devil-muted">
          决定成立度
        </p>
        <p className="mt-3 font-display text-3xl tracking-[0.06em]" style={{ color: tone.color }}>
          {verdictType}
        </p>
        <p className="mt-1 font-serif-cn text-lg text-devil-ivory/80">{tone.zh}</p>
      </div>
    </motion.div>
  );
}
