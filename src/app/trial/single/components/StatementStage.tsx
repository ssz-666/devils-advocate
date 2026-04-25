"use client";

import { useEffect, useRef, useState } from "react";
import { CourtroomButton } from "@/components/home/courtroom-button";
import { useDebateStore } from "@/lib/store/debate";
import { useSettingsStore } from "@/lib/store/settings";

export function StatementStage() {
  const [statement, setStatement] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startDebate = useDebateStore((state) => state.startDebate);
  const hasApiKey = useSettingsStore((state) => state.hasApiKey);
  const openSettings = useSettingsStore((state) => state.openSettings);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [statement]);

  function enterCourt() {
    if (!statement.trim()) {
      return;
    }

    if (!hasApiKey()) {
      openSettings();
      return;
    }

    startDebate(statement.trim(), "single");
  }

  return (
    <section className="relative flex min-h-screen items-center justify-center px-5 pt-24 sm:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-devil-muted">
          第一阶段 / 三 · 陈述
        </p>
        <h1 className="mt-5 font-serif-cn text-5xl leading-tight tracking-[-0.06em] text-devil-ivory sm:text-7xl">
          你正在考虑做什么？
        </h1>
        <p className="mt-4 font-serif-cn text-2xl text-devil-ivory/80">
          请清楚地陈述你正在考虑的决定
        </p>

        <div className="mt-10 border border-devil-gold/55 bg-devil-bg-soft/95 p-1 shadow-[0_0_80px_rgba(139,0,0,0.12)]">
          <textarea
            ref={textareaRef}
            className="min-h-[200px] w-full resize-none bg-[linear-gradient(180deg,rgba(184,134,11,0.035),transparent_34%),#14141A] px-6 py-6 font-body-cn text-lg leading-9 text-devil-ivory outline-none placeholder:text-devil-muted/55"
            value={statement}
            onChange={(event) => setStatement(event.target.value)}
            placeholder="例如：我打算下周辞职，去做自由职业。已经存了8个月生活费，但还没有稳定客户。"
          />
        </div>

        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body-cn text-sm text-devil-muted">
            越具体越真诚，反驳才会越有价值。
          </p>
          <div className={!statement.trim() ? "pointer-events-none opacity-45" : undefined}>
            <CourtroomButton
              href="#debate"
              onClick={(event) => {
                event.preventDefault();
                enterCourt();
              }}
            >
              开庭
            </CourtroomButton>
          </div>
        </div>
      </div>
    </section>
  );
}
