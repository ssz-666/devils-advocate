"use client";

import { motion } from "framer-motion";
import { Send, Square } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createChatCompletion } from "@/lib/llm/client";
import {
  buildCourtOpeningPrompt,
  buildCourtRoleMessages,
  COURTROOM_PERSONAS,
} from "@/lib/llm/prompts";
import { useDebateStore } from "@/lib/store/debate";
import { useSettingsStore } from "@/lib/store/settings";

type CourtStep =
  | "opening"
  | "prosecution"
  | "user-defense"
  | "cross"
  | "user-cross"
  | "support"
  | "adjourned";

function sanitizeCourtContent(content: string) {
  return content
    .replace(/^\s*[\[【(（][^\]】)）\n]{1,40}[\]】)）]\s*/u, "")
    .replace(/^\s*(法官|控方律师|辩方律师)\s+(The Judge|Prosecution|Defense)\s*/u, "")
    .trimStart();
}

function playSubtleInk(enabled: boolean) {
  if (!enabled || typeof window === "undefined") {
    return;
  }

  const browserWindow = window as typeof window & {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  const AudioContextClass = browserWindow.AudioContext ?? browserWindow.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.value = 120;
  gain.gain.setValueAtTime(0.025, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.12);
}

function playGavel(enabled: boolean) {
  if (!enabled || typeof window === "undefined") {
    return;
  }

  const browserWindow = window as typeof window & {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  const AudioContextClass = browserWindow.AudioContext ?? browserWindow.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.value = 160;
  gain.gain.setValueAtTime(0.045, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.18);
}

function CourtBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-60">
      <svg className="h-full w-full" fill="none" viewBox="0 0 1200 900">
        <path
          d="M200 720h800M350 720V380M850 720V380M420 320h360M600 130v160M520 290l-110 90-80 180h160l-80-180M680 290l110 90 80 180H710l80-180"
          stroke="rgba(184,134,11,0.35)"
        />
        <path d="M260 760h680M320 800h560" stroke="rgba(184,134,11,0.22)" />
        <path d="M600 290V760" stroke="rgba(184,134,11,0.16)" />
      </svg>
    </div>
  );
}

export function CourtDebateStage({ onFinish }: { onFinish: () => void }) {
  const statement = useDebateStore((state) => state.statement);
  const messages = useDebateStore((state) => state.messages);
  const addMessage = useDebateStore((state) => state.addMessage);
  const updateMessage = useDebateStore((state) => state.updateMessage);
  const endDebate = useDebateStore((state) => state.endDebate);

  const provider = useSettingsStore((state) => state.provider);
  const apiKey = useSettingsStore((state) => state.apiKey);
  const baseUrl = useSettingsStore((state) => state.baseUrl);
  const model = useSettingsStore((state) => state.model);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const gavelSoundEnabled = useSettingsStore((state) => state.gavelSoundEnabled);

  const [step, setStep] = useState<CourtStep>("opening");
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bootRef = useRef(false);

  const waitingForUser = step === "user-defense" || step === "user-cross";
  const canSend = input.trim().length > 0 && waitingForUser && !isStreaming && !isFinishing;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (bootRef.current || messages.length > 0) {
      return;
    }

    bootRef.current = true;
    void runOpening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const personaById = useMemo(
    () =>
      Object.fromEntries(
        Object.values(COURTROOM_PERSONAS).map((persona) => [persona.id, persona]),
      ),
    [],
  );

  async function streamCourtMessage(
    speakerId: "judge" | "prosecution" | "defense",
    request: ReturnType<typeof buildCourtRoleMessages> | ReturnType<typeof buildCourtOpeningPrompt>,
  ) {
    const persona = COURTROOM_PERSONAS[speakerId];
    setIsStreaming(true);
    const messageId = addMessage({
      role: "agent",
      content: "",
      speakerId: persona.id,
      speakerName: `${persona.name} ${persona.enName}`,
      accentColor: persona.accent,
    });
    let partial = "";

    try {
      await createChatCompletion({
        provider,
        apiKey,
        baseUrl,
        model,
        messages: request,
        onToken: (token) => {
          partial += token;
          updateMessage(messageId, sanitizeCourtContent(partial));
        },
        purpose: "general",
        requestTag: `Court-${speakerId}`,
        retryCount: 1,
        stream: true,
        temperature: 0.72,
        timeoutMs: 12000,
      });
      playSubtleInk(soundEnabled);
    } catch {
      const fallback =
        speakerId === "judge"
          ? "本庭已经记下这段沉默，程序继续。"
          : speakerId === "prosecution"
            ? "控方记录在案，但指控尚未说尽。"
            : "辩方仍在场，只是不愿替空洞辩护。";
      updateMessage(messageId, sanitizeCourtContent(partial) || fallback);
    } finally {
      setIsStreaming(false);
    }
  }

  async function runOpening() {
    setStep("opening");
    await streamCourtMessage("judge", buildCourtOpeningPrompt(statement));
    await runProsecution();
  }

  async function runProsecution() {
    setStep("prosecution");
    await streamCourtMessage(
      "prosecution",
      buildCourtRoleMessages(
        statement,
        COURTROOM_PERSONAS.prosecution.prompt,
        useDebateStore.getState().messages,
        "列出三条最强指控，用法庭陈词的方式攻击该决定的漏洞。",
      ),
    );
    setStep("user-defense");
  }

  async function runCrossExam() {
    setStep("cross");
    await streamCourtMessage(
      "prosecution",
      buildCourtRoleMessages(
        statement,
        COURTROOM_PERSONAS.prosecution.prompt,
        useDebateStore.getState().messages,
        "针对被告刚才的答辩继续盘问，只追打 2 到 3 个最致命的问题。",
      ),
    );
    setStep("user-cross");
  }

  async function runDefense() {
    setStep("support");
    await streamCourtMessage(
      "defense",
      buildCourtRoleMessages(
        statement,
        COURTROOM_PERSONAS.defense.prompt,
        useDebateStore.getState().messages,
        "只为真正站得住的部分做简短支持，不要替明显薄弱的地方硬撑。",
      ),
    );
  }

  async function moveToVerdict() {
    if (isFinishing) {
      return;
    }

    setIsFinishing(true);
    setStep("adjourned");

    const messageId = addMessage({
      role: "agent",
      content: "",
      speakerId: COURTROOM_PERSONAS.judge.id,
      speakerName: `${COURTROOM_PERSONAS.judge.name} ${COURTROOM_PERSONAS.judge.enName}`,
      accentColor: COURTROOM_PERSONAS.judge.accent,
    });

    updateMessage(messageId, "本庭已听取各方陈词。现在进入评议与宣判。");
    playGavel(gavelSoundEnabled);

    void endDebate();
    onFinish();
  }

  async function handleUserSubmit() {
    if (!canSend) {
      return;
    }

    addMessage({
      role: "user",
      content: input.trim(),
      speakerName: "被告 / 证人",
    });
    setInput("");

    if (step === "user-defense") {
      await runCrossExam();
      return;
    }

    if (step === "user-cross") {
      await runDefense();
      await moveToVerdict();
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden px-5 pb-40 pt-24 sm:px-8">
      <CourtBackdrop />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="border border-devil-red/40 bg-devil-bg-soft/45 p-5">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-devil-red">
            控方席 PROSECUTION
          </p>
          <p className="mt-3 font-serif-cn text-sm leading-7 text-devil-muted">
            攻击决定的一切脆弱处。
          </p>
        </div>
        <div className="border border-devil-gold/40 bg-devil-bg-soft/45 p-5">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-devil-gold">
            辩方席 DEFENSE
          </p>
          <p className="mt-3 font-serif-cn text-sm leading-7 text-devil-muted">
            只替真正站得住的部分发声。
          </p>
        </div>
      </div>

      <div
        className="relative z-10 mx-auto mt-8 flex max-h-[calc(100vh-18rem)] max-w-6xl flex-col gap-7 overflow-y-auto pr-2"
        ref={scrollRef}
      >
        {messages.map((message) => {
          const accent = message.accentColor ?? "#E8E6E3";
          const isJudge = message.speakerId === "judge";
          const persona = message.speakerId ? personaById[message.speakerId] : null;

          return (
            <motion.div
              animate={{ opacity: 1, y: 0, scale: isJudge ? 1.02 : 1 }}
              className={
                isJudge
                  ? "mx-auto max-w-3xl border border-devil-ivory/30 bg-devil-bg-soft/70 px-5 py-5 text-center"
                  : message.role === "user"
                    ? "mx-auto w-full max-w-3xl border border-devil-line bg-devil-bg-soft/40 px-5 py-5"
                    : "border border-devil-line bg-devil-bg-soft/40 px-5 py-5"
              }
              initial={{ opacity: 0, y: 20 }}
              key={message.id}
            >
              <p
                className="font-mono text-[0.62rem] uppercase tracking-[0.24em]"
                style={{ color: accent }}
              >
                {message.speakerName}
              </p>
              <p
                className={`mt-3 font-body-cn text-base leading-8 text-devil-ivory ${
                  isJudge ? "text-lg" : ""
                }`}
              >
                {message.content}
              </p>
              {!isJudge && persona ? (
                <div
                  className="mt-4 h-px w-full"
                  style={{
                    background: `linear-gradient(90deg, ${persona.accent}, transparent)`,
                  }}
                />
              ) : null}
            </motion.div>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-devil-line bg-devil-bg/88 px-5 py-5 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-end">
          <textarea
            className="min-h-14 flex-1 resize-none border-b border-devil-gold bg-devil-bg-soft/80 px-4 py-4 font-serif-cn text-base leading-7 text-devil-ivory outline-none placeholder:text-devil-muted/60"
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleUserSubmit();
              }
            }}
            placeholder={
              step === "user-defense"
                ? "向法官作第一轮答辩。"
                : step === "user-cross"
                  ? "回应控方盘问，补足你的证词。"
                  : "等待庭审推进…"
            }
            readOnly={!waitingForUser || isStreaming || isFinishing}
            value={input}
          />
          <div className="flex gap-3">
            <button
              className="quill-cursor inline-flex h-14 items-center gap-2 bg-devil-red px-5 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-ivory transition-colors hover:bg-[#a50000] disabled:opacity-40"
              disabled={!canSend}
              onClick={() => void handleUserSubmit()}
              type="button"
            >
              <Send className="size-4" />
              提交证词
            </button>
            <button
              className="quill-cursor inline-flex h-14 items-center gap-2 border border-devil-line px-5 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-muted transition-colors hover:border-devil-gold hover:text-devil-ivory disabled:opacity-40"
              disabled={isFinishing}
              onClick={() => void moveToVerdict()}
              type="button"
            >
              <Square className="size-3" />
              {isFinishing ? "评议中…" : "进入宣判"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
