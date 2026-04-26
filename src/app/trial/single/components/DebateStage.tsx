"use client";

import { motion } from "framer-motion";
import { Send, Square } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createChatCompletion } from "@/lib/llm/client";
import { buildDebateMessages, buildInitialUserPrompt } from "@/lib/llm/prompts";
import { type DebateMessage, useDebateStore } from "@/lib/store/debate";
import { useSettingsStore } from "@/lib/store/settings";
import { cn } from "@/lib/utils";

const TEN_MINUTES = 10 * 60;

type WindowWithAudioContext = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${rest.toString().padStart(2, "0")}`;
}

function AgentAvatar() {
  return (
    <div className="flex items-center gap-3">
      <svg className="size-9 text-devil-gold" fill="none" viewBox="0 0 40 40">
        <path d="M20 5 31 12v12c0 6-4.6 10-11 12C13.6 34 9 30 9 24V12L20 5Z" stroke="currentColor" />
        <path d="M14 18h12M16 24h8" stroke="currentColor" />
        <path d="M15 12 10 7M25 12l5-5" stroke="#8B0000" />
      </svg>
      <div>
        <p className="font-serif-cn text-sm text-devil-ivory">魔鬼代言人</p>
        <p className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-devil-muted">
          反方质询官
        </p>
      </div>
    </div>
  );
}

function playInkSound(enabled: boolean) {
  if (!enabled || typeof window === "undefined") {
    return;
  }

  const browserWindow = window as WindowWithAudioContext;
  const AudioContextClass = browserWindow.AudioContext || browserWindow.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 92;
  gain.gain.setValueAtTime(0.025, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.12);
}

function MessageItem({ message }: { message: DebateMessage }) {
  if (message.role === "user") {
    return (
      <motion.div
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        className="flex justify-end"
        initial={{ opacity: 0, filter: "blur(10px)", y: 12 }}
      >
        <div className="max-w-[82%] bg-[#1E1E24] px-5 py-4 font-serif-cn text-base leading-8 text-devil-ivory/90 sm:max-w-[64%]">
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      className="space-y-4"
      initial={{ opacity: 0, filter: "blur(12px)", y: 12 }}
    >
      <AgentAvatar />
      <div className="border-l border-devil-red pl-5 font-body-cn text-[17px] leading-9 text-devil-ivory">
        {message.content || "……"}
      </div>
    </motion.div>
  );
}

export function DebateStage() {
  const [input, setInput] = useState("");
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(TEN_MINUTES);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const bootstrappedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const statement = useDebateStore((state) => state.statement);
  const messages = useDebateStore((state) => state.messages);
  const startedAt = useDebateStore((state) => state.startedAt);
  const addMessage = useDebateStore((state) => state.addMessage);
  const updateMessage = useDebateStore((state) => state.updateMessage);
  const endDebate = useDebateStore((state) => state.endDebate);
  const openSettings = useSettingsStore((state) => state.openSettings);
  const provider = useSettingsStore((state) => state.provider);
  const apiKey = useSettingsStore((state) => state.apiKey);
  const baseUrl = useSettingsStore((state) => state.baseUrl);
  const model = useSettingsStore((state) => state.model);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const hasApiKey = useSettingsStore((state) => state.hasApiKey);
  const isConfigured = hasApiKey();

  const canSend = useMemo(
    () => input.trim().length > 0 && !isStreaming && isConfigured,
    [input, isConfigured, isStreaming],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const nextRemaining = Math.max(TEN_MINUTES - elapsed, 0);
      setRemainingSeconds(nextRemaining);
      if (nextRemaining === 0) {
        void finishDebate();
      }
    }, 1000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [input]);

  useEffect(() => {
    if (bootstrappedRef.current || messages.length > 0) {
      return;
    }

    bootstrappedRef.current = true;
    void generateAgentReply([
      {
        id: "initial-statement",
        role: "user",
        content: buildInitialUserPrompt(statement),
        createdAt: Date.now(),
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, statement]);

  async function generateAgentReply(conversation: DebateMessage[]) {
    if (!isConfigured) {
      openSettings();
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsStreaming(true);
    setError("");
    const agentMessageId = addMessage({ role: "agent", content: "" });
    let partial = "";

    try {
      await createChatCompletion({
        provider,
        apiKey,
        baseUrl,
        model,
        messages: buildDebateMessages(statement, conversation),
        stream: true,
        temperature: 0.72,
        signal: controller.signal,
        onToken: (token) => {
          partial += token;
          updateMessage(agentMessageId, partial);
        },
      });
      playInkSound(soundEnabled);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        updateMessage(agentMessageId, partial || "质询已被打断。");
      } else {
        const message = caught instanceof Error ? caught.message : "模型请求失败。";
        setError(message);
        updateMessage(agentMessageId, `请求失败：${message}`);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  function interruptStreaming() {
    if (!isStreaming) {
      return;
    }

    abortRef.current?.abort();
  }

  function handleInputChange(value: string) {
    if (value && isStreaming) {
      interruptStreaming();
    }
    setInput(value);
  }

  async function submitUserMessage() {
    const content = input.trim();
    if (!content || isStreaming) {
      return;
    }

    if (!isConfigured) {
      openSettings();
      return;
    }

    setInput("");
    addMessage({ role: "user", content });
    const conversation = useDebateStore.getState().messages;
    playInkSound(soundEnabled);
    await generateAgentReply(conversation);
  }

  async function finishDebate() {
    abortRef.current?.abort();
    await endDebate();
  }

  return (
    <section className="relative min-h-screen px-5 pb-40 pt-24 sm:px-8" id="debate">
      <div className="mx-auto flex max-w-6xl items-start justify-between gap-4">
        <button
          className="quill-cursor max-w-xl border border-devil-line bg-devil-bg-soft/70 px-4 py-3 text-left transition-colors hover:border-devil-gold"
          onClick={() => setIsStatementOpen((value) => !value)}
          type="button"
        >
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-devil-gold">
            原始陈述
          </p>
          <p
            className={cn(
              "mt-2 font-body-cn text-sm leading-7 text-devil-muted",
              isStatementOpen ? "" : "line-clamp-2",
            )}
          >
            {statement}
          </p>
        </button>
        <div className="flex items-center gap-3 font-mono text-sm tracking-[0.22em] text-devil-muted">
          {isStreaming ? <span className="size-2 animate-slow-pulse bg-devil-red" /> : null}
          {formatTime(remainingSeconds)}
        </div>
      </div>

      <div
        className="mx-auto mt-10 flex max-h-[calc(100vh-17rem)] max-w-5xl flex-col gap-9 overflow-y-auto pr-2"
        ref={scrollRef}
      >
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        {error ? (
          <p className="border-l border-devil-gold pl-4 font-body-cn text-sm text-devil-muted">
            {error}
          </p>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-devil-line bg-devil-bg/90 px-5 py-5 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-end">
          <div className="group flex-1 border-b border-devil-gold bg-devil-bg-soft/80 transition-colors focus-within:border-devil-red">
            <textarea
              ref={textareaRef}
              className="max-h-40 min-h-14 w-full resize-none bg-transparent px-4 py-4 font-serif-cn text-base leading-7 text-devil-ivory outline-none placeholder:text-devil-muted/60"
              onChange={(event) => handleInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submitUserMessage();
                }
              }}
              placeholder={
                isStreaming ? "输入即可打断反方发言。" : "反驳它。Enter 发送，Shift+Enter 换行。"
              }
              value={input}
            />
          </div>
          <div className="flex gap-3">
            <button
              className="quill-cursor inline-flex h-14 items-center gap-2 bg-devil-red px-5 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-ivory transition-colors hover:bg-[#a50000] disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!canSend}
              onClick={() => void submitUserMessage()}
              type="button"
            >
              <Send className="size-4" />
              发送
            </button>
            <button
              className="quill-cursor inline-flex h-14 items-center gap-2 border border-devil-line px-5 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-muted transition-colors hover:border-devil-gold hover:text-devil-ivory"
              onClick={() => void finishDebate()}
              type="button"
            >
              <Square className="size-3" />
              结束辩论
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
