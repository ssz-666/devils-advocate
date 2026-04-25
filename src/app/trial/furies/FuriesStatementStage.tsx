"use client";

import { CourtroomButton } from "@/components/home/courtroom-button";
import { useDebateStore } from "@/lib/store/debate";
import { useState } from "react";

export function FuriesStatementStage({ onStart }: { onStart: () => void }) {
  const [statement, setStatement] = useState("");
  const startDebate = useDebateStore((state) => state.startDebate);
  const canStart = statement.trim().length > 0;

  return (
    <section className="relative min-h-screen overflow-hidden px-5 pb-24 pt-28 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,0,0,0.16),transparent_35%),radial-gradient(circle_at_50%_50%,rgba(184,134,11,0.06),transparent_55%)]" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-devil-gold">
          Stage 1 of 3 · Five Furies
        </p>
        <h1 className="mt-6 font-display text-5xl tracking-[-0.06em] text-devil-ivory sm:text-7xl">
          What will you defend
          <br />
          under five lights?
        </h1>
        <p className="mt-5 font-serif-cn text-2xl text-devil-ivory/82">
          请陈述那个即将被五种人格轮番围攻的决定
        </p>

        <div className="mt-10 border border-devil-gold/60 bg-devil-bg-soft/70 p-4 sm:p-6">
          <textarea
            className="min-h-[220px] w-full resize-none bg-transparent font-body-cn text-lg leading-9 text-devil-ivory outline-none placeholder:text-devil-muted/65"
            onChange={(event) => setStatement(event.target.value)}
            placeholder="例如：我准备离开现在的工作，去做一个风险很高但我非常想做的内容品牌。"
            value={statement}
          />
        </div>

        <p className="mt-4 font-body-cn text-sm leading-7 text-devil-muted">
          五个角色不会彼此重复，他们会从五种不同的恶意与关切里拆你。
        </p>

        <div className="mt-10 flex justify-center">
          <div
            aria-disabled={!canStart}
            className={!canStart ? "pointer-events-none opacity-40" : ""}
            onClick={() => {
              if (!canStart) {
                return;
              }

              startDebate(statement.trim(), "furies");
              onStart();
            }}
          >
            <CourtroomButton>召集五人</CourtroomButton>
          </div>
        </div>
      </div>
    </section>
  );
}
