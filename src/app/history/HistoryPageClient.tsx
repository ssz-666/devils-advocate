"use client";

import Link from "next/link";
import { Download, Search, Share2, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  deleteDebateSession,
  exportDebateSessions,
  listDebateSessions,
  type DebateMode,
  type DebateSession,
} from "@/lib/store/debate";

type SortKey = "latest" | "score";

function resolveVerdictHref(session: DebateSession) {
  if (session.mode === "single") {
    return `/trial/single/verdict?session=${session.id}`;
  }

  return `/history?session=${session.id}`;
}

export function HistoryPageClient() {
  const [sessions, setSessions] = useState<DebateSession[]>([]);
  const [query, setQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<"all" | DebateMode>("all");
  const [sortKey, setSortKey] = useState<SortKey>("latest");
  const jsonLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    void listDebateSessions().then(setSessions);
  }, []);

  const filteredSessions = useMemo(() => {
    const base = sessions.filter((session) => {
      const matchesQuery =
        !query ||
        session.statement.toLowerCase().includes(query.toLowerCase()) ||
        session.verdict?.oneLiner.toLowerCase().includes(query.toLowerCase());
      const matchesMode = modeFilter === "all" || session.mode === modeFilter;
      return matchesQuery && matchesMode;
    });

    if (sortKey === "score") {
      return [...base].sort(
        (left, right) =>
          (right.verdict?.convictionScore ?? -1) - (left.verdict?.convictionScore ?? -1),
      );
    }

    return [...base].sort((left, right) => right.updatedAt - left.updatedAt);
  }, [modeFilter, query, sessions, sortKey]);

  async function handleDelete(sessionId: string) {
    await deleteDebateSession(sessionId);
    setSessions((current) => current.filter((session) => session.id !== sessionId));
  }

  async function handleExport() {
    const json = await exportDebateSessions();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = jsonLinkRef.current;
    if (!link) {
      return;
    }

    link.href = url;
    link.download = `devils-advocate-history-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleShare(session: DebateSession) {
    const text = `${session.statement}\n成立度 ${session.verdict?.convictionScore ?? "待定"} · ${session.mode}`;
    await navigator.clipboard.writeText(text);
  }

  return (
    <section className="min-h-screen px-5 pb-24 pt-28 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-devil-gold">
          History Archive
        </p>
        <h1 className="mt-5 font-serif-cn text-5xl leading-tight tracking-[-0.06em] text-devil-ivory sm:text-7xl">
          卷宗档案
        </h1>
        <p className="mt-4 max-w-2xl font-body-cn text-base leading-8 text-devil-muted">
          回看每一场辩论、每一份判决，以及你是怎样被说服，或怎样坚持下来的。
        </p>

        <div className="mt-10 grid gap-3 rounded-sm border border-devil-line bg-devil-bg-soft/40 p-4 sm:grid-cols-[1fr_auto_auto_auto]">
          <label className="flex items-center gap-3 border border-devil-line bg-devil-bg px-4 py-3">
            <Search className="size-4 text-devil-gold" />
            <input
              className="w-full bg-transparent font-body-cn text-sm text-devil-ivory outline-none placeholder:text-devil-muted"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索决定摘要、金句..."
              value={query}
            />
          </label>

          <select
            className="border border-devil-line bg-devil-bg px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-ivory"
            onChange={(event) => setModeFilter(event.target.value as "all" | DebateMode)}
            value={modeFilter}
          >
            <option value="all">全部模式</option>
            <option value="single">单刀</option>
            <option value="furies">围攻</option>
            <option value="court">法庭</option>
          </select>

          <select
            className="border border-devil-line bg-devil-bg px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-ivory"
            onChange={(event) => setSortKey(event.target.value as SortKey)}
            value={sortKey}
          >
            <option value="latest">按时间</option>
            <option value="score">按分数</option>
          </select>

          <button
            className="quill-cursor inline-flex items-center justify-center gap-2 border border-devil-line px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-muted transition-colors hover:border-devil-gold hover:text-devil-ivory"
            onClick={() => void handleExport()}
            type="button"
          >
            <Download className="size-4" />
            导出 JSON
          </button>
          <a className="hidden" ref={jsonLinkRef} />
        </div>

        <div className="mt-8 grid gap-4">
          {filteredSessions.length === 0 ? (
            <div className="border border-devil-line bg-devil-bg-soft/60 p-6 font-body-cn text-devil-muted">
              还没有已封存的辩论记录。
            </div>
          ) : null}

          {filteredSessions.map((session) => (
            <article
              className="border border-devil-line bg-devil-bg-soft/45 p-6 transition-colors hover:border-devil-gold"
              key={session.id}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-3xl">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-devil-muted">
                    {new Date(session.updatedAt).toLocaleString("zh-CN")} · NO. {session.verdictNumber}
                  </p>
                  <p className="mt-3 line-clamp-2 font-body-cn text-base leading-8 text-devil-ivory">
                    {session.statement}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="border border-devil-line px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-devil-muted">
                      {session.mode}
                    </span>
                    <span className="border border-devil-line px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-devil-muted">
                      {session.messages.length} 条消息
                    </span>
                    {session.verdict ? (
                      <span className="border border-devil-line px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-devil-gold">
                        {session.verdict.verdict} · {session.verdict.convictionScore}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 sm:justify-end">
                  <Link
                    className="quill-cursor bg-devil-red px-4 py-3 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-devil-ivory transition-colors hover:bg-[#a50000]"
                    href={resolveVerdictHref(session)}
                  >
                    查看判决
                  </Link>
                  <button
                    className="quill-cursor border border-devil-line px-4 py-3 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-devil-muted transition-colors hover:border-devil-gold hover:text-devil-ivory"
                    onClick={() => void handleShare(session)}
                    type="button"
                  >
                    <Share2 className="mr-2 inline size-3.5" />
                    复制分享
                  </button>
                  <button
                    className="quill-cursor border border-devil-line px-4 py-3 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-devil-muted transition-colors hover:border-devil-red hover:text-devil-red"
                    onClick={() => void handleDelete(session.id)}
                    type="button"
                  >
                    <Trash2 className="mr-2 inline size-3.5" />
                    删除
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
