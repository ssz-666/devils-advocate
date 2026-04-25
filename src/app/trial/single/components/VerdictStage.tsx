"use client";

import Link from "next/link";
import { useDebateStore } from "@/lib/store/debate";

export function VerdictStage() {
  const messages = useDebateStore((state) => state.messages);
  const statement = useDebateStore((state) => state.statement);
  const reset = useDebateStore((state) => state.reset);

  return (
    <section className="relative flex min-h-screen items-center justify-center px-5 py-28 sm:px-8">
      <div className="mx-auto max-w-3xl border border-devil-line bg-devil-bg-soft/70 p-8 text-center shadow-[0_0_80px_rgba(139,0,0,0.12)]">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-devil-gold">
          第三阶段 / 三 · 判决
        </p>
        <h1 className="mt-5 font-serif-cn text-5xl leading-tight tracking-[-0.06em] text-devil-ivory sm:text-7xl">
          判决生成中……
        </h1>
        <p className="mx-auto mt-6 max-w-xl font-body-cn text-base leading-8 text-devil-muted">
          辩论记录已经保存到 IndexedDB。下一阶段会在这里生成结构化裁决、风险等级和可分享长图。
        </p>

        <div className="mt-8 border border-devil-line bg-devil-bg/70 p-5 text-left">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-devil-muted">
            本次陈述
          </p>
          <p className="mt-3 line-clamp-3 font-body-cn text-sm leading-7 text-devil-ivory/80">
            {statement || "暂无陈述。"}
          </p>
          <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-devil-gold">
            已记录 {messages.length} 条辩论消息
          </p>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            className="quill-cursor bg-devil-red px-6 py-4 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-ivory transition-colors hover:bg-[#a50000]"
            href="/trial/single"
            onClick={() => reset()}
          >
            再审一次
          </Link>
          <Link
            className="quill-cursor border border-devil-line px-6 py-4 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-muted transition-colors hover:border-devil-gold hover:text-devil-ivory"
            href="/"
          >
            回到首页
          </Link>
        </div>
      </div>
    </section>
  );
}
