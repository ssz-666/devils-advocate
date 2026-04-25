"use client";

import { useEffect, useRef } from "react";
import {
  clearDebateSessions,
  exportDebateSessions,
  importDebateSessions,
} from "@/lib/store/debate";
import { useSettingsStore } from "@/lib/store/settings";

export function SettingsPageClient() {
  const provider = useSettingsStore((state) => state.provider);
  const apiKey = useSettingsStore((state) => state.apiKey);
  const model = useSettingsStore((state) => state.model);
  const baseUrl = useSettingsStore((state) => state.baseUrl);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const gavelSoundEnabled = useSettingsStore((state) => state.gavelSoundEnabled);
  const theme = useSettingsStore((state) => state.theme);
  const hydrate = useSettingsStore((state) => state.hydrate);
  const setProvider = useSettingsStore((state) => state.setProvider);
  const setApiKey = useSettingsStore((state) => state.setApiKey);
  const setModel = useSettingsStore((state) => state.setModel);
  const setBaseUrl = useSettingsStore((state) => state.setBaseUrl);
  const setSoundEnabled = useSettingsStore((state) => state.setSoundEnabled);
  const setGavelSoundEnabled = useSettingsStore((state) => state.setGavelSoundEnabled);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  async function handleExport() {
    const json = await exportDebateSessions();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `devils-advocate-data-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(file: File) {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      return;
    }

    await importDebateSessions(parsed);
  }

  return (
    <section className="min-h-screen px-5 pb-24 pt-28 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-devil-gold">
          Settings
        </p>
        <h1 className="mt-5 font-serif-cn text-5xl leading-tight tracking-[-0.06em] text-devil-ivory sm:text-7xl">
          设置与后勤
        </h1>
        <p className="mt-4 max-w-2xl font-body-cn text-base leading-8 text-devil-muted">
          这里不华丽，但决定产品是否真正可用。
        </p>

        <div className="mt-10 grid gap-6">
          <section className="border border-devil-line bg-devil-bg-soft/40 p-6">
            <h2 className="font-serif-cn text-3xl text-devil-ivory">模型服务</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                className="border border-devil-line bg-devil-bg px-4 py-3 font-body-cn text-devil-ivory outline-none"
                onChange={(event) => setProvider(event.target.value as typeof provider)}
                value={provider}
              />
              <input
                className="border border-devil-line bg-devil-bg px-4 py-3 font-body-cn text-devil-ivory outline-none"
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="API Key"
                value={apiKey}
              />
              <input
                className="border border-devil-line bg-devil-bg px-4 py-3 font-body-cn text-devil-ivory outline-none"
                onChange={(event) => setModel(event.target.value)}
                placeholder="Model"
                value={model}
              />
              <input
                className="border border-devil-line bg-devil-bg px-4 py-3 font-body-cn text-devil-ivory outline-none"
                onChange={(event) => setBaseUrl(event.target.value)}
                placeholder="Base URL"
                value={baseUrl}
              />
            </div>
            <p className="mt-4 font-body-cn text-sm leading-7 text-devil-muted">
              判决阶段会自动使用快速模型以保证响应速度。
            </p>
          </section>

          <section className="border border-devil-line bg-devil-bg-soft/40 p-6">
            <h2 className="font-serif-cn text-3xl text-devil-ivory">主题与音效</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <select
                className="border border-devil-line bg-devil-bg px-4 py-3 font-body-cn text-devil-ivory outline-none"
                onChange={(event) => setTheme(event.target.value as typeof theme)}
                value={theme}
              >
                <option value="dark">Dark Chamber</option>
                <option value="midnight">Midnight Brief</option>
              </select>
              <label className="flex items-center justify-between border border-devil-line bg-devil-bg px-4 py-3 font-body-cn text-devil-ivory">
                墨水声
                <input
                  checked={soundEnabled}
                  onChange={(event) => setSoundEnabled(event.target.checked)}
                  type="checkbox"
                />
              </label>
              <label className="flex items-center justify-between border border-devil-line bg-devil-bg px-4 py-3 font-body-cn text-devil-ivory">
                法槌声
                <input
                  checked={gavelSoundEnabled}
                  onChange={(event) => setGavelSoundEnabled(event.target.checked)}
                  type="checkbox"
                />
              </label>
            </div>
          </section>

          <section className="border border-devil-line bg-devil-bg-soft/40 p-6">
            <h2 className="font-serif-cn text-3xl text-devil-ivory">数据管理</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className="quill-cursor border border-devil-line px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-devil-muted transition-colors hover:border-devil-gold hover:text-devil-ivory"
                onClick={() => void handleExport()}
                type="button"
              >
                导出全部记录
              </button>
              <button
                className="quill-cursor border border-devil-line px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-devil-muted transition-colors hover:border-devil-gold hover:text-devil-ivory"
                onClick={() => importRef.current?.click()}
                type="button"
              >
                导入 JSON
              </button>
              <button
                className="quill-cursor border border-devil-red px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-devil-red transition-colors hover:bg-devil-red hover:text-devil-ivory"
                onClick={() => void clearDebateSessions()}
                type="button"
              >
                清空所有历史
              </button>
              <input
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleImport(file);
                  }
                }}
                ref={importRef}
                type="file"
              />
            </div>
          </section>

          <section className="border border-devil-line bg-devil-bg-soft/40 p-6">
            <h2 className="font-serif-cn text-3xl text-devil-ivory">关于</h2>
            <p className="mt-4 font-body-cn text-base leading-8 text-devil-muted">
              反方辩友是一个把“决策前的自我反对”产品化的实验。它不治愈你，只负责让你更难自欺。
            </p>
            <div className="mt-6 flex flex-wrap gap-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-devil-muted">
              <a href="https://github.com" rel="noreferrer" target="_blank">
                GitHub
              </a>
              <span>作者：You + Codex</span>
              <span>反馈：issues / discussions / email</span>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
