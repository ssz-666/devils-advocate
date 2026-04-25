"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createChatCompletion } from "@/lib/llm/client";
import {
  type LlmProvider,
  PROVIDER_CONFIGS,
  useSettingsStore,
} from "@/lib/store/settings";

const providers = Object.entries(PROVIDER_CONFIGS) as Array<
  [LlmProvider, (typeof PROVIDER_CONFIGS)[LlmProvider]]
>;

export function SettingsModal() {
  const apiKey = useSettingsStore((state) => state.apiKey);
  const baseUrl = useSettingsStore((state) => state.baseUrl);
  const closeSettings = useSettingsStore((state) => state.closeSettings);
  const hydrate = useSettingsStore((state) => state.hydrate);
  const isSettingsOpen = useSettingsStore((state) => state.isSettingsOpen);
  const model = useSettingsStore((state) => state.model);
  const provider = useSettingsStore((state) => state.provider);
  const setApiKey = useSettingsStore((state) => state.setApiKey);
  const setBaseUrl = useSettingsStore((state) => state.setBaseUrl);
  const setModel = useSettingsStore((state) => state.setModel);
  const setProvider = useSettingsStore((state) => state.setProvider);
  const setSoundEnabled = useSettingsStore((state) => state.setSoundEnabled);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const [testStatus, setTestStatus] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isSettingsOpen) {
    return null;
  }

  async function testConnection() {
    setIsTesting(true);
    setTestStatus("正在测试连接…");

    try {
      await createChatCompletion({
        provider,
        apiKey,
        baseUrl,
        model,
        messages: [{ role: "user", content: "请只回复：连接正常。" }],
        stream: false,
        temperature: 0,
        timeoutMs: 15000,
      });
      setTestStatus("连接正常。");
    } catch (error) {
      setTestStatus(error instanceof Error ? error.message : "连接失败。");
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] bg-devil-bg/75 backdrop-blur-sm">
      <button
        aria-label="关闭设置"
        className="absolute inset-0 cursor-default"
        onClick={closeSettings}
        type="button"
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl border-l border-devil-line bg-devil-bg-soft shadow-[0_0_80px_rgba(0,0,0,0.55)]">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-devil-line px-6 py-5">
            <div>
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.28em] text-devil-gold">
                模型设置
              </p>
              <h2 className="mt-2 font-serif-cn text-3xl text-devil-ivory">配置你的反方引擎</h2>
            </div>
            <button
              aria-label="关闭设置"
              className="quill-cursor grid size-9 place-items-center border border-devil-line text-devil-muted transition-colors hover:border-devil-red hover:text-devil-ivory"
              onClick={closeSettings}
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <label className="block">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-devil-muted">
                服务商
              </span>
              <select
                className="mt-3 w-full border border-devil-line bg-devil-bg px-4 py-3 font-serif-cn text-devil-ivory outline-none transition-colors focus:border-devil-gold"
                onChange={(event) => setProvider(event.target.value as LlmProvider)}
                value={provider}
              >
                {providers.map(([key, config]) => (
                  <option key={key} value={key}>
                    {key === "openai" ? `${config.label}（国内访问较慢）` : config.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-devil-muted">
                API Key
              </span>
              <input
                className="mt-3 w-full border border-devil-line bg-devil-bg px-4 py-3 font-mono text-sm text-devil-ivory outline-none transition-colors focus:border-devil-gold"
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="sk-..."
                type="password"
                value={apiKey}
              />
            </label>

            <label className="block">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-devil-muted">
                模型
              </span>
              <input
                className="mt-3 w-full border border-devil-line bg-devil-bg px-4 py-3 font-mono text-sm text-devil-ivory outline-none transition-colors focus:border-devil-gold"
                onChange={(event) => setModel(event.target.value)}
                placeholder="deepseek-chat"
                value={model}
              />
            </label>

            <label className="block">
              <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-devil-muted">
                Base URL
              </span>
              <input
                className="mt-3 w-full border border-devil-line bg-devil-bg px-4 py-3 font-mono text-sm text-devil-ivory outline-none transition-colors focus:border-devil-gold"
                onChange={(event) => setBaseUrl(event.target.value)}
                placeholder="https://api.deepseek.com"
                value={baseUrl}
              />
            </label>

            <label className="flex items-center justify-between border border-devil-line px-4 py-3">
              <span className="font-serif-cn text-sm text-devil-muted">墨水落纸音效</span>
              <input
                checked={soundEnabled}
                className="accent-devil-red"
                onChange={(event) => setSoundEnabled(event.target.checked)}
                type="checkbox"
              />
            </label>

            <div className="space-y-4">
              <div className="border border-devil-line bg-devil-bg/60 p-4 font-body-cn text-sm leading-7 text-devil-muted">
                隐私声明：API Key 仅保存在你的浏览器 localStorage 中，并做简单异或混淆。当前阶段所有请求都由前端直连模型服务商，不经过项目后端代理。
              </div>
              <div className="border border-devil-gold/30 bg-devil-bg/60 p-4 font-body-cn text-sm leading-7 text-devil-muted">
                判决阶段会自动使用快速模型以保证响应速度。你在这里选择的慢模型仍可用于辩论主过程，但判决页会强制切换到对应服务商的快模型。
              </div>
            </div>

            {testStatus ? (
              <p className="border-l border-devil-gold pl-3 font-body-cn text-sm leading-6 text-devil-ivory/80">
                {testStatus}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-devil-line px-6 py-5">
            <button
              className="quill-cursor border border-devil-line px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-muted transition-colors hover:border-devil-gold hover:text-devil-ivory"
              disabled={isTesting}
              onClick={testConnection}
              type="button"
            >
              {isTesting ? "测试中…" : "测试连接"}
            </button>
            <button
              className="quill-cursor bg-devil-red px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-ivory transition-colors hover:bg-[#a50000]"
              onClick={closeSettings}
              type="button"
            >
              保存并关闭
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
