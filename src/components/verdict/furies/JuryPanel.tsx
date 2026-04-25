"use client";

import { motion } from "framer-motion";
import { FURY_PERSONAS } from "@/lib/llm/prompts";

type JuryCard = {
  id: string;
  score: number;
  zh: string;
  en: string;
  verdict: "agree" | "oppose" | "neutral";
};

function FuryBadge({ id, accent }: { id: string; accent: string }) {
  const mirrored = id === "future-self";
  const inverted = id === "the-nemesis";

  return (
    <svg className="size-14" fill="none" style={{ color: accent }} viewBox="0 0 60 60">
      <g
        transform={`${mirrored ? "translate(60,0) scale(-1,1)" : ""} ${inverted ? "translate(0,60) scale(1,-1)" : ""}`}
      >
        <circle cx="30" cy="18" r="10" stroke="currentColor" />
        <path d="M16 48c4-11 10-16 14-16s10 5 14 16" stroke="currentColor" />
        <path d="M22 18h16M24 22h12" stroke="currentColor" />
      </g>
    </svg>
  );
}

export function JuryPanel({
  state,
  jurors,
}: {
  state: "pending" | "ready";
  jurors: JuryCard[];
}) {
  const displayRows =
    state === "ready"
      ? jurors
      : FURY_PERSONAS.map((persona) => ({
          id: persona.id,
          score: 0,
          zh: "Deliberating...",
          en: "",
          verdict: "neutral" as const,
        }));

  return (
    <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {displayRows.map((row, index) => {
        const persona = FURY_PERSONAS.find((item) => item.id === row.id) ?? FURY_PERSONAS[index];
        const tone =
          row.verdict === "agree"
            ? "border-devil-gold/50"
            : row.verdict === "oppose"
              ? "border-devil-red/45"
              : "border-devil-line";

        return (
          <motion.article
            animate={state === "ready" ? { opacity: 1, rotateY: 0, y: 0 } : { opacity: 1 }}
            className={`min-h-[240px] border bg-devil-bg/50 p-5 ${tone}`}
            initial={state === "ready" ? { opacity: 0, rotateY: -90, y: 10 } : false}
            key={row.id}
            transition={{ delay: state === "ready" ? index * 0.15 : 0, duration: 0.45 }}
          >
            <div className="flex items-center justify-between">
              <FuryBadge accent={persona.accent} id={persona.id} />
              <p className="font-display text-4xl text-devil-ivory/92">
                {state === "ready" ? row.score : "—"}
              </p>
            </div>
            <p className="mt-5 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-devil-muted">
              {persona.enName}
            </p>
            <p className="mt-2 font-serif-cn text-lg text-devil-ivory">{persona.name}</p>
            {state === "ready" ? (
              <>
                <p className="mt-5 font-body-cn text-sm leading-7 text-devil-ivory/90">{row.zh}</p>
                <p className="mt-3 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-devil-muted">
                  {row.en}
                </p>
              </>
            ) : (
              <div className="mt-6 space-y-3">
                <div className="h-4 w-full animate-pulse bg-devil-line/50" />
                <div className="h-4 w-4/5 animate-pulse bg-devil-line/35" />
                <p className="pt-3 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-devil-muted">
                  Deliberating...
                </p>
              </div>
            )}
          </motion.article>
        );
      })}
    </section>
  );
}
