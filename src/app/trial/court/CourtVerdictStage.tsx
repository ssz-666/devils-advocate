"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, ExternalLink, History, RefreshCw, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CaseAssessmentBars } from "@/components/verdict/court/CaseAssessmentBars";
import { CourtSkeleton } from "@/components/verdict/court/CourtSkeleton";
import { JudicialCommentary } from "@/components/verdict/court/JudicialCommentary";
import { JudgeRuling } from "@/components/verdict/court/JudgeRuling";
import { QuestionSummary } from "@/components/verdict/QuestionSummary";
import { ShareableCourtImage } from "@/components/verdict/court/ShareableCourtImage";
import { FlawsAndPillars } from "@/components/verdict/FlawsAndPillars";
import { downloadElementAsPng, type ShareImageVariant } from "@/lib/image/generateImage";
import { createChatCompletion } from "@/lib/llm/client";
import {
  buildCourtCommentaryPrompt,
  buildDeepAnalysisPrompt,
  buildQuickJudgmentPrompt,
  parseCourtCommentary,
  parseDeepAnalysis,
  parseQuickJudgment,
  summarizeStatement,
} from "@/lib/llm/verdictPrompt";
import { compressConversation } from "@/lib/verdict/compress";
import { deriveCourtBreakdown } from "@/lib/verdict/courtScoring";
import { COURT_VERDICT_TEMPLATES, type CourtSentence } from "@/lib/verdict/courtVerdictTemplates";
import { summarizeDecisionQuestion } from "@/lib/verdict/questionSummary";
import { scoreToBand } from "@/lib/verdict/quoteSelector";
import type { VerdictType } from "@/lib/verdict/templates";
import type { VerdictData } from "@/lib/store/debate";
import { useDebateStore } from "@/lib/store/debate";
import { useSettingsStore } from "@/lib/store/settings";

type ToastState = {
  visible: boolean;
  message: string;
};

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
  gain.gain.setValueAtTime(0.05, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.18);
}

function fallbackQuickJudgment() {
  return { score: 50, verdictType: "UNRESOLVED" as VerdictType };
}

function pickCourtSentence(verdictType: VerdictType, score: number): CourtSentence {
  const band = scoreToBand(score);
  const pool = COURT_VERDICT_TEMPLATES[verdictType][band];
  return pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
}

export function CourtVerdictStage({ onRestart }: { onRestart: () => void }) {
  const statement = useDebateStore((state) => state.statement);
  const messages = useDebateStore((state) => state.messages);
  const verdictNumber = useDebateStore((state) => state.verdictNumber);
  const setVerdict = useDebateStore((state) => state.setVerdict);
  const reset = useDebateStore((state) => state.reset);

  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const provider = useSettingsStore((state) => state.provider);
  const apiKey = useSettingsStore((state) => state.apiKey);
  const baseUrl = useSettingsStore((state) => state.baseUrl);
  const model = useSettingsStore((state) => state.model);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const gavelSoundEnabled = useSettingsStore((state) => state.gavelSoundEnabled);

  const [toast, setToast] = useState<ToastState>({ visible: false, message: "" });
  const [statusClock, setStatusClock] = useState(Date.now());
  const [score, setScore] = useState<number | null>(null);
  const [verdictType, setVerdictType] = useState<VerdictType | null>(null);
  const [sentence, setSentence] = useState<CourtSentence | null>(null);
  const [breakdown, setBreakdown] = useState<ReturnType<typeof deriveCourtBreakdown> | null>(null);
  const [rulingState, setRulingState] = useState<"pending" | "ready">("pending");
  const [commentaryState, setCommentaryState] = useState<"hidden" | "pending" | "streaming" | "ready">("pending");
  const [analysisState, setAnalysisState] = useState<"pending" | "ready" | "hidden">("pending");
  const [commentary, setCommentary] = useState({ en: "", zh: "" });
  const [commentaryRaw, setCommentaryRaw] = useState("");
  const [analysis, setAnalysis] = useState<{ fatalFlaws: string[]; solidPillars: string[] } | null>(null);
  const [analysisStartedAt, setAnalysisStartedAt] = useState<number | null>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const squareRef = useRef<HTMLDivElement>(null);
  const landscapeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrateSettings();
  }, [hydrateSettings]);

  useEffect(() => {
    const loading = commentaryState === "pending" || commentaryState === "streaming" || analysisState === "pending";
    if (!loading) {
      return;
    }
    const timer = window.setInterval(() => setStatusClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [analysisState, commentaryState]);

  useEffect(() => {
    if (!toast.visible) {
      return;
    }
    const timer = window.setTimeout(() => setToast({ visible: false, message: "" }), 2200);
    return () => window.clearTimeout(timer);
  }, [toast.visible]);

  const compressed = useMemo(() => compressConversation(statement, messages), [messages, statement]);
  const statementSummary = useMemo(() => summarizeStatement(statement, 80), [statement]);
  const questionSummary = useMemo(() => summarizeDecisionQuestion(statement), [statement]);

  useEffect(() => {
    if (!statement) {
      return;
    }

    const controller = new AbortController();
    const fallback = fallbackQuickJudgment();
    setAnalysisStartedAt(Date.now());

    console.log("[Court C1] sent at", Date.now());
    createChatCompletion({
      provider,
      apiKey,
      baseUrl,
      model,
      messages: [
        { role: "system", content: buildQuickJudgmentPrompt(compressed).system },
        { role: "user", content: buildQuickJudgmentPrompt(compressed).user },
      ],
      timeoutMs: 12000,
      retryCount: 1,
      maxTokens: 20,
      temperature: 0.3,
      signal: controller.signal,
      purpose: "verdict",
      requestTag: "Court C1",
    })
      .then((response) => {
        const parsed = parseQuickJudgment(response.content);
        console.log("[Court C1] received at", Date.now());
        return parsed;
      })
      .catch(() => fallback)
      .then((quick) => {
        const nextSentence = pickCourtSentence(quick.verdictType as VerdictType, quick.score);
        const nextBreakdown = deriveCourtBreakdown(quick.score);
        setScore(quick.score);
        setVerdictType(quick.verdictType as VerdictType);
        setSentence(nextSentence);
        setBreakdown(nextBreakdown);
        setRulingState("ready");
        if (soundEnabled) {
          playGavel(gavelSoundEnabled);
        }

        console.log("[Court C2] sent at", Date.now());
        setCommentaryState("streaming");
        setCommentaryRaw("");
        createChatCompletion({
          provider,
          apiKey,
          baseUrl,
          model,
          messages: [
            { role: "system", content: buildCourtCommentaryPrompt(statementSummary, quick.verdictType, quick.score).system },
            { role: "user", content: buildCourtCommentaryPrompt(statementSummary, quick.verdictType, quick.score).user },
          ],
          timeoutMs: 12000,
          retryCount: 1,
          maxTokens: 100,
          temperature: 0.7,
          signal: controller.signal,
          purpose: "verdict",
          requestTag: "Court C2",
          stream: true,
          onToken: (token) => setCommentaryRaw((current) => current + token),
        })
          .then((response) => {
            console.log("[Court C2] received at", Date.now());
            const parsed = parseCourtCommentary(response.content);
            setCommentary(parsed);
            setCommentaryState(parsed.en || parsed.zh ? "ready" : "hidden");
          })
          .catch(() => {
            setCommentaryState("hidden");
          });
      });

    console.log("[Court C3] sent at", Date.now());
    createChatCompletion({
      provider,
      apiKey,
      baseUrl,
      model,
      messages: [
        { role: "system", content: buildDeepAnalysisPrompt(compressed).system },
        { role: "user", content: buildDeepAnalysisPrompt(compressed).user },
      ],
      timeoutMs: 12000,
      retryCount: 1,
      maxTokens: 400,
      temperature: 0.6,
      signal: controller.signal,
      purpose: "verdict",
      requestTag: "Court C3",
    })
      .then((response) => {
        console.log("[Court C3] received at", Date.now());
        const parsed = parseDeepAnalysis(response.content);
        setAnalysis(parsed);
        setAnalysisState("ready");
        setAnalysisStartedAt(null);
      })
      .catch(() => {
        setAnalysisState("hidden");
        setAnalysisStartedAt(null);
      });

    return () => controller.abort();
  }, [apiKey, baseUrl, compressed, gavelSoundEnabled, model, provider, soundEnabled, statement, statementSummary]);

  useEffect(() => {
    if (!score || !verdictType || !sentence) {
      return;
    }

    const nextVerdict: VerdictData = {
      convictionScore: score,
      verdict: verdictType,
      fatalFlaws: (analysis?.fatalFlaws ?? []).map((item, index) => ({
        flaw: item,
        weight: index === 0 ? "HIGH" : "MEDIUM",
      })),
      solidPillars: (analysis?.solidPillars ?? []).map((item, index) => ({
        pillar: item,
        strength: index === 0 ? "STRONG" : "STABLE",
      })),
      sentence: sentence.ruling,
      sentenceZh: sentence.rulingZh,
      oneLiner: commentary.zh || sentence.admonitionZh,
      advocateRemark: sentence.admonitionZh,
      meta: {
        source: analysisState === "ready" ? "assembled" : "request-a",
        status: analysisState === "ready" ? "final" : "partial",
        generatedAt: Date.now(),
      },
    };
    void setVerdict(nextVerdict);
  }, [analysis, analysisState, score, sentence, setVerdict, verdictType, commentary.zh]);

  const progressText =
    analysisStartedAt && statusClock - analysisStartedAt > 12000
      ? "Taking longer than usual..."
      : "Examining arguments...";

  const previewCommentary = useMemo(() => {
    if (commentaryState !== "streaming") {
      return commentary;
    }
    const parsed = parseCourtCommentary(commentaryRaw);
    return {
      en: parsed.en,
      zh: parsed.zh,
    };
  }, [commentary, commentaryRaw, commentaryState]);

  async function handleDownload(variant: ShareImageVariant) {
    const targetRef =
      variant === "portrait" ? portraitRef : variant === "square" ? squareRef : landscapeRef;
    if (!targetRef.current || !sentence || !breakdown) {
      return;
    }
    await downloadElementAsPng(targetRef.current, variant, `court-ruling-${Date.now()}-${variant}.png`);
    setToast({ visible: true, message: "判决书已封存" });
  }

  async function handleShare() {
    const text = `法庭宣判 · ${sentence?.rulingZh ?? "本庭已作裁示。"}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "法庭最终宣判", text, url: window.location.href });
        return;
      } catch {
        // fall through
      }
    }
    await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
    setToast({ visible: true, message: "分享文案已复制" });
  }

  return (
    <section className="relative min-h-screen overflow-hidden px-5 pb-24 pt-28 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,0,0,0.18),transparent_34%)]" />
      <div className="relative z-10">
        <CourtSkeleton verdictNumber={verdictNumber}>
          <CaseAssessmentBars
            breakdown={breakdown ?? deriveCourtBreakdown(50)}
            state={rulingState}
          />
          <QuestionSummary summary={questionSummary} />
          {sentence ? (
            <JudgeRuling sentence={sentence} state={rulingState} />
          ) : (
            <JudgeRuling sentence={pickCourtSentence("UNRESOLVED", 50)} state="pending" />
          )}
          <JudicialCommentary
            en={previewCommentary.en}
            state={commentaryState}
            zh={previewCommentary.zh}
          />
          <FlawsAndPillars
            fatalFlaws={analysis?.fatalFlaws ?? []}
            progressText={progressText}
            solidPillars={analysis?.solidPillars ?? []}
            state={analysisState}
          />
        </CourtSkeleton>

        <div className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-center gap-3">
        <button
          className="quill-cursor inline-flex items-center gap-2 bg-devil-red px-5 py-4 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-ivory transition-colors hover:bg-[#a50000]"
          onClick={() => void handleDownload("portrait")}
          type="button"
        >
          <Download className="size-4" />
          下载判决书
        </button>
        <button
          className="quill-cursor inline-flex items-center gap-2 border border-devil-line px-5 py-4 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-muted transition-colors hover:border-devil-gold hover:text-devil-ivory"
          onClick={() => void handleShare()}
          type="button"
        >
          <Share2 className="size-4" />
          分享到…
        </button>
        <button
          className="quill-cursor inline-flex items-center gap-2 border border-devil-line px-5 py-4 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-muted transition-colors hover:border-devil-gold hover:text-devil-ivory"
          onClick={() => {
            reset("court");
            onRestart();
          }}
          type="button"
        >
          <RefreshCw className="size-4" />
          再审一案
        </button>
        <Link
          className="inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-devil-muted transition-colors hover:text-devil-gold"
          href="/history"
        >
          <History className="size-4" />
          查看历史
          <ExternalLink className="size-4" />
        </Link>
        </div>
      </div>

      {sentence && breakdown ? (
        <div className="pointer-events-none fixed left-[-99999px] top-0 opacity-0">
          <div ref={portraitRef}>
            <ShareableCourtImage
              breakdown={breakdown}
              commentaryZh={commentary.zh}
              fatalFlaws={analysis?.fatalFlaws ?? []}
              solidPillars={analysis?.solidPillars ?? []}
              sentence={sentence}
              statement={statement}
              variant="portrait"
              verdictNumber={verdictNumber}
            />
          </div>
          <div ref={squareRef}>
            <ShareableCourtImage
              breakdown={breakdown}
              commentaryZh={commentary.zh}
              fatalFlaws={analysis?.fatalFlaws ?? []}
              solidPillars={analysis?.solidPillars ?? []}
              sentence={sentence}
              statement={statement}
              variant="square"
              verdictNumber={verdictNumber}
            />
          </div>
          <div ref={landscapeRef}>
            <ShareableCourtImage
              breakdown={breakdown}
              commentaryZh={commentary.zh}
              fatalFlaws={analysis?.fatalFlaws ?? []}
              solidPillars={analysis?.solidPillars ?? []}
              sentence={sentence}
              statement={statement}
              variant="landscape"
              verdictNumber={verdictNumber}
            />
          </div>
        </div>
      ) : null}

      <AnimatePresence>
        {toast.visible ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 z-[91] border border-devil-gold bg-devil-bg-soft px-5 py-4 font-body-cn text-sm text-devil-ivory shadow-[0_0_40px_rgba(139,0,0,0.14)]"
            exit={{ opacity: 0, y: 10 }}
            initial={{ opacity: 0, y: 18 }}
          >
            {toast.message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
