"use client";

import { useState } from "react";
import { CourtroomButton } from "@/components/home/courtroom-button";
import { useDebateStore } from "@/lib/store/debate";

export function CourtStatementStage({ onStart }: { onStart: () => void }) {
  const [statement, setStatement] = useState("");
  const startDebate = useDebateStore((state) => state.startDebate);

  return (
    <section className="relative min-h-screen px-5 pb-24 pt-28 sm:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-devil-gold">
          Stage 1 of 3 · Courtroom
        </p>
        <h1 className="mt-6 font-display text-5xl tracking-[-0.06em] text-devil-ivory sm:text-7xl">
          State the case
          <br />
          before the court.
        </h1>
        <p className="mt-5 font-serif-cn text-2xl text-devil-ivory/82">
          请提交将被正式立案审理的决定
        </p>

        <div className="mt-10 border border-devil-gold/60 bg-devil-bg-soft/70 p-4 sm:p-6">
          <textarea
            className="min-h-[220px] w-full resize-none bg-transparent font-body-cn text-lg leading-9 text-devil-ivory outline-none placeholder:text-devil-muted/65"
            onChange={(event) => setStatement(event.target.value)}
            placeholder="例如：我准备离开现在这段关系，尽管这会影响家庭、收入和未来计划。"
            value={statement}
          />
        </div>

        <div className="mt-10 flex justify-center">
          <div
            aria-disabled={!statement.trim()}
            className={!statement.trim() ? "pointer-events-none opacity-40" : ""}
            onClick={() => {
              if (!statement.trim()) {
                return;
              }
              startDebate(statement.trim(), "court");
              onStart();
            }}
          >
            <CourtroomButton>开庭审理</CourtroomButton>
          </div>
        </div>
      </div>
    </section>
  );
}
