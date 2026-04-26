"use client";

import { motion } from "framer-motion";
import { Send, Square } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createChatCompletion } from "@/lib/llm/client";
import {
  buildFuriesVerdictPrompt,
  buildFuryMessages,
  FURY_PERSONAS,
} from "@/lib/llm/prompts";
import { useDebateStore } from "@/lib/store/debate";
import { useSettingsStore } from "@/lib/store/settings";

type JuryVerdict = {
  jurors: Array<{ id: string; score: number; remark: string }>;
  judgeScore: number;
  judgeVerdict: "CONVICTED" | "UNRESOLVED" | "ACQUITTED";
  judgeRemark: string;
};

const TOTAL_TURNS = FURY_PERSONAS.length * 2;

const PERSONA_FALLBACK_LINES: Record<string, string> = {
  "the-father": "你这份决心还没把代价算明白。热情先到了，责任还没跟上。",
  "future-self": "十年后回看，真正让人后悔的，往往不是迟疑，而是没算清后果就出手。",
  "the-ex": "你还是老样子，先替情绪写结论，再逼现实签字。",
  "the-fan": "我当然想相信你能赢，可光靠相信，不会自动长出底牌。",
  "the-nemesis": "这一步要是真走错了，最好笑的不是失败，是你事先明明看见了裂缝。",
};

function parseJuryVerdict(raw: string): JuryVerdict | null {
  const matched = raw.match(/\{[\s\S]*\}/);
  if (!matched) {
    return null;
  }

  try {
    return JSON.parse(matched[0]) as JuryVerdict;
  } catch {
    return null;
  }
}

function sanitizeFuryContent(content: string) {
  return content
    .replace(/^\s*[\[{(【（][^\]})】）\n]{0,40}[\]})】）]\s*/u, "")
    .replace(
      /^\s*(严父|十年后的你|前任|粉丝|死敌)\s*(The Father|Future Self|The Ex|The Fan|The Nemesis)?[:：\s-]*/u,
      "",
    )
    .trim();
}

function FuryAvatar({
  isActive,
  color,
  mirrored = false,
  inverted = false,
}: {
  isActive: boolean;
  color: string;
  mirrored?: boolean;
  inverted?: boolean;
}) {
  return (
    <motion.div
      animate={{ opacity: isActive ? 1 : 0.32, scale: isActive ? 1.04 : 1, y: isActive ? -4 : 0 }}
      className="grid place-items-center"
      transition={{ duration: 0.35 }}
    >
      <svg className="size-14" fill="none" style={{ color }} viewBox="0 0 60 60">
        <g
          transform={`${mirrored ? "translate(60,0) scale(-1,1)" : ""} ${inverted ? "translate(0,60) scale(1,-1)" : ""}`}
        >
          <circle cx="30" cy="18" r="10" stroke="currentColor" />
          <path d="M16 48c4-11 10-16 14-16s10 5 14 16" stroke="currentColor" />
          <path d="M22 18h16M24 22h12" stroke="currentColor" />
        </g>
      </svg>
    </motion.div>
  );
}

function buildLocalJuryVerdict(turnsCount: number): JuryVerdict {
  const pressure = Math.min(22, turnsCount * 2);

  return {
    jurors: FURY_PERSONAS.map((persona, index) => ({
      id: persona.id,
      score: Math.max(22, Math.min(88, 42 + index * 9 - Math.floor(pressure / 3))),
      remark: [
        "证词里还有空位，立场暂时没有锁死。",
        "你给出了一些理由，但还不够压住风险。",
        "真正的代价已经出现，证据却还没跟上。",
        "这份决定不是没机会，只是还欠最后一层硬度。",
        "情绪已经到了，结构还没完全到位。",
      ][index],
    })),
    judgeScore: Math.max(35, Math.min(76, 56 - Math.floor(pressure / 4))),
    judgeVerdict: pressure > 16 ? "UNRESOLVED" : "ACQUITTED",
    judgeRemark:
      pressure > 16
        ? "五份敌意已经够你停下来复核一次，还不到宣称稳妥的时候。"
        : "围攻尚未彻底击穿你的立场，但它也远没有到无懈可击。",
  };
}

export function FuriesDebateStage({ onFinish }: { onFinish: () => void }) {
  const statement = useDebateStore((state) => state.statement);
  const messages = useDebateStore((state) => state.messages);
  const addMessage = useDebateStore((state) => state.addMessage);
  const updateMessage = useDebateStore((state) => state.updateMessage);
  const endDebate = useDebateStore((state) => state.endDebate);
  const setVerdict = useDebateStore((state) => state.setVerdict);

  const provider = useSettingsStore((state) => state.provider);
  const apiKey = useSettingsStore((state) => state.apiKey);
  const baseUrl = useSettingsStore((state) => state.baseUrl);
  const model = useSettingsStore((state) => state.model);

  const [turnIndex, setTurnIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bootRef = useRef(false);

  const canSend = input.trim().length > 0 && !isStreaming && !isClosing;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (bootRef.current || messages.length > 0) {
      return;
    }

    bootRef.current = true;
    void generatePersonaTurn(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  async function generatePersonaTurn(nextTurnIndex: number) {
    const persona = FURY_PERSONAS[nextTurnIndex % FURY_PERSONAS.length];
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
      await new Promise((resolve) => window.setTimeout(resolve, 500));
      await createChatCompletion({
        provider,
        apiKey,
        baseUrl,
        model,
        messages: buildFuryMessages(statement, persona.prompt, useDebateStore.getState().messages),
        onToken: (token) => {
          partial += token;
          updateMessage(messageId, sanitizeFuryContent(partial));
        },
        purpose: "general",
        requestTag: `F-${persona.id}`,
        retryCount: 1,
        stream: true,
        temperature: 0.78,
        timeoutMs: 12000,
      });
    } catch {
      const fallback = PERSONA_FALLBACK_LINES[persona.id] ?? "这一轮话没有落下来，但怀疑还在场。";
      updateMessage(messageId, sanitizeFuryContent(partial) || fallback);
    } finally {
      setIsStreaming(false);
    }
  }

  async function finalizeJury() {
    if (isClosing) {
      return;
    }

    setIsClosing(true);
    const local = buildLocalJuryVerdict(useDebateStore.getState().messages.length);

    void setVerdict({
      convictionScore: local.judgeScore,
      verdict: local.judgeVerdict,
      fatalFlaws: local.jurors.slice(0, 3).map((item) => ({
        flaw: item.remark,
        weight: "MEDIUM",
      })),
      solidPillars: local.jurors.slice(-2).map((item) => ({
        pillar: `仍可成立：${item.remark}`,
        strength: "STABLE",
      })),
      sentence: "Five witnesses spoke. None came to flatter you.",
      sentenceZh: local.judgeRemark,
      oneLiner: local.judgeRemark,
      advocateRemark: "合议已毕，别再拿热情当证据。",
      meta: {
        source: "assembled",
        status: "final",
        generatedAt: Date.now(),
      },
    });

    void endDebate();
    onFinish();

    void (async () => {
      try {
        const response = await createChatCompletion({
          provider,
          apiKey,
          baseUrl,
          model,
          messages: buildFuriesVerdictPrompt(statement, useDebateStore.getState().messages),
          purpose: "general",
          requestTag: "F-jury",
          retryCount: 1,
          stream: false,
          temperature: 0.45,
          timeoutMs: 12000,
        });

        const parsed = parseJuryVerdict(response.content);
        if (!parsed) {
          return;
        }

        void setVerdict({
          convictionScore: parsed.judgeScore,
          verdict: parsed.judgeVerdict,
          fatalFlaws: parsed.jurors.slice(0, 3).map((item) => ({
            flaw: item.remark,
            weight: "MEDIUM",
          })),
          solidPillars: parsed.jurors.slice(-2).map((item) => ({
            pillar: `仍可成立：${item.remark}`,
            strength: "STABLE",
          })),
          sentence: "Five witnesses spoke. None came to flatter you.",
          sentenceZh: parsed.judgeRemark,
          oneLiner: parsed.judgeRemark,
          advocateRemark: "合议已毕，别再拿热情当证据。",
          meta: {
            source: "assembled",
            status: "final",
            generatedAt: Date.now(),
          },
        });
      } catch {
        // Keep local verdict if refinement fails.
      }
    })();
  }

  async function handleSend() {
    if (!canSend) {
      return;
    }

    addMessage({
      role: "user",
      content: input.trim(),
      speakerName: "用户",
    });
    setInput("");

    const nextTurn = turnIndex + 1;
    setTurnIndex(nextTurn);

    if (nextTurn >= TOTAL_TURNS) {
      await finalizeJury();
      return;
    }

    await generatePersonaTurn(nextTurn);
  }

  const personaMap = useMemo(
    () => Object.fromEntries(FURY_PERSONAS.map((persona) => [persona.id, persona])),
    [],
  );

  return (
    <section className="relative min-h-screen overflow-hidden px-5 pb-40 pt-24 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,0,0,0.18),transparent_28%),radial-gradient(circle_at_50%_50%,rgba(184,134,11,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(255,255,255,0.02),transparent_20%,rgba(255,255,255,0.02),transparent_40%,rgba(255,255,255,0.02),transparent_60%,rgba(255,255,255,0.02),transparent_80%,rgba(255,255,255,0.02))]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-center gap-4 border border-devil-line bg-devil-bg/60 px-5 py-4">
          {FURY_PERSONAS.map((persona, index) => (
            <div className="flex flex-col items-center gap-2" key={persona.id}>
              <FuryAvatar
                color={persona.accent}
                inverted={persona.id === "the-nemesis"}
                isActive={index === turnIndex % FURY_PERSONAS.length}
                mirrored={persona.id === "future-self"}
              />
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-devil-muted">
                {persona.enName}
              </p>
            </div>
          ))}
        </div>

        <div
          className="mx-auto mt-8 flex max-h-[calc(100vh-16rem)] max-w-5xl flex-col gap-7 overflow-y-auto pr-2"
          ref={scrollRef}
        >
          {messages.map((message) => {
            const persona = message.speakerId ? personaMap[message.speakerId] : null;

            if (message.role === "user") {
              return (
                <div className="flex justify-end" key={message.id}>
                  <div className="max-w-[72%] bg-[#1E1E24] px-5 py-4 font-serif-cn text-base leading-8 text-devil-ivory/90">
                    {message.content}
                  </div>
                </div>
              );
            }

            return (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
                initial={{ opacity: 0, y: 18 }}
                key={message.id}
              >
                <div className="flex items-center gap-3">
                  <FuryAvatar
                    color={persona?.accent ?? message.accentColor ?? "#B8860B"}
                    inverted={persona?.id === "the-nemesis"}
                    isActive
                    mirrored={persona?.id === "future-self"}
                  />
                  <div>
                    <p className="font-serif-cn text-lg text-devil-ivory">{message.speakerName}</p>
                    <p className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-devil-muted">
                      Fury Testimony
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ scaleY: 1 }}
                  className="border-l pl-5 font-body-cn text-[17px] leading-9 text-devil-ivory"
                  initial={{ scaleY: 0 }}
                  style={{
                    borderColor: persona?.accent ?? message.accentColor ?? "#B8860B",
                    transformOrigin: "top",
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {message.content || "……"}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-devil-line bg-devil-bg/88 px-5 py-5 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-end">
          <textarea
            className="relative z-10 min-h-14 flex-1 resize-none border-b border-devil-gold bg-devil-bg-soft/80 px-4 py-4 font-serif-cn text-base leading-7 text-devil-ivory outline-none placeholder:text-devil-muted/60"
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            placeholder="回应五人的轮番质询……"
            value={input}
          />
          <div className="flex gap-3">
            <button
              className="quill-cursor inline-flex h-14 items-center gap-2 bg-devil-red px-5 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-ivory transition-colors hover:bg-[#a50000] disabled:opacity-40"
              disabled={!canSend}
              onClick={() => void handleSend()}
              type="button"
            >
              <Send className="size-4" />
              送上答辩
            </button>
            <button
              className="quill-cursor inline-flex h-14 items-center gap-2 border border-devil-line px-5 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-muted transition-colors hover:border-devil-gold hover:text-devil-ivory disabled:opacity-40"
              disabled={isClosing}
              onClick={() => void finalizeJury()}
              type="button"
            >
              <Square className="size-3" />
              {isClosing ? "合议中…" : "提前合议"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
