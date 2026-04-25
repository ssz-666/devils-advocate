"use client";

import Link from "next/link";
import { GitBranch, History, Settings } from "lucide-react";
import { BrandMark } from "@/components/site/brand-mark";
import { useSettingsStore } from "@/lib/store/settings";

export function Header() {
  const openSettings = useSettingsStore((state) => state.openSettings);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-devil-line/60 bg-devil-bg/55 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/">
          <BrandMark />
        </Link>
        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            className="quill-cursor group inline-flex items-center gap-2 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-devil-muted transition-colors hover:text-devil-ivory"
            href="/history"
          >
            <History className="size-3.5 text-devil-gold/70 transition-transform group-hover:-rotate-6" />
            历史记录
          </Link>
          <Link
            className="quill-cursor group inline-flex items-center gap-2 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-devil-muted transition-colors hover:text-devil-ivory"
            href="/settings"
          >
            <Settings className="size-3.5 text-devil-gold/70 transition-transform group-hover:-rotate-6" />
            设置页
          </Link>
          <button
            className="quill-cursor group inline-flex items-center gap-2 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-devil-muted transition-colors hover:text-devil-ivory"
            onClick={openSettings}
            type="button"
          >
            <Settings className="size-3.5 text-devil-gold/70 transition-transform group-hover:-rotate-6" />
            快速设置
          </button>
          <a
            className="quill-cursor group inline-flex items-center gap-2 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-devil-muted transition-colors hover:text-devil-ivory"
            href="https://github.com"
            rel="noreferrer"
            target="_blank"
          >
            <GitBranch className="size-3.5 text-devil-gold/70 transition-transform group-hover:-rotate-6" />
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
