"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, ExternalLink, History, RefreshCw, Share2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConvictionGauge } from "@/components/verdict/ConvictionGauge";
import { FlawsAndPillars } from "@/components/verdict/FlawsAndPillars";
import { QuestionSummary } from "@/components/verdict/QuestionSummary";
import { QuoteDisplay } from "@/components/verdict/QuoteDisplay";
import { ShareableImage } from "@/components/verdict/ShareableImage";
import { VerdictSkeleton } from "@/components/verdict/VerdictSkeleton";
import { VerdictTemplate } from "@/components/verdict/VerdictTemplate";
import { VerdictTypeLabel } from "@/components/verdict/VerdictTypeLabel";
import {
  downloadElementAsPng,
  generatePngFile,
  type ShareImageVariant,
} from "@/lib/image/generateImage";
import { createChatCompletion } from "@/lib/llm/client";
import { getPublicAppUrl } from "@/lib/share/appUrl";
import {
  buildDeepAnalysisPrompt,
  buildQuickJudgmentPrompt,
  buildQuoteSelectionPrompt,
  parseDeepAnalysis,
  parseQuickJudgment,
  parseQuoteSelection,
  parseQuoteSelectionPreview,
  summarizeStatement,
} from "@/lib/llm/verdictPrompt";
import { classifyDecision } from "@/lib/verdict/classifier";
import { compressConversation } from "@/lib/verdict/compress";
import { selectCandidateQuotes } from "@/lib/verdict/quoteSelector";
import { summarizeDecisionQuestion } from "@/lib/verdict/questionSummary";
import { VERDICT_TEMPLATES, type VerdictType } from "@/lib/verdict/templates";
import type { Quote } from "@/lib/verdict/quotesLibrary";
import {
  getDebateSessionWithTimeout,
  type DebateSession,
  type VerdictData,
  useDebateStore,
} from "@/lib/store/debate";
import { useSettingsStore } from "@/lib/store/settings";

type ToastState = {
  visible: boolean;
  message: string;
};

type RequestPhase = "pending" | "streaming" | "ready" | "hidden";

type QuoteResult = {
  en: string;
  zh: string;
};

type AnalysisResult = {
  fatalFlaws: string[];
  solidPillars: string[];
};

function pickSessionSnapshot(state: ReturnType<typeof useDebateStore.getState>): DebateSession {
  return {
    id: state.id,
    currentStage: state.currentStage,
    statement: state.statement,
    messages: state.messages,
    startedAt: state.startedAt,
    endedAt: state.endedAt,
    mode: state.mode,
    verdict: state.verdict,
    verdictNumber: state.verdictNumber,
    updatedAt: state.updatedAt,
  };
}

function createFallbackQuickJudgment() {
  return {
    score: 50,
    verdictType: "UNRESOLVED" as VerdictType,
  };
}

function pickRandomQuote(quotes: Quote[]): QuoteResult {
  const picked = quotes[Math.floor(Math.random() * quotes.length)] ?? {
    en: "The court withholds certainty, not seriousness.",
    zh: "本庭暂缓确定，不曾放松严厉。",
    tone: "cold" as const,
  };

  return {
    en: picked.en,
    zh: picked.zh,
  };
}

function createVerdictData(
  score: number,
  verdictType: VerdictType,
  quote: QuoteResult,
  analysis: AnalysisResult | null,
): VerdictData {
  return {
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
    sentence: quote.en,
    sentenceZh: quote.zh,
    oneLiner: quote.zh,
    advocateRemark: VERDICT_TEMPLATES[verdictType].closingZh,
    meta: {
      source: analysis ? "assembled" : "request-b",
      status: analysis ? "final" : "partial",
      generatedAt: Date.now(),
    },
  };
}

export function VerdictPageClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");
  const setVerdict = useDebateStore((state) => state.setVerdict);
  const hydrateSession = useDebateStore((state) => state.hydrateSession);
  const reset = useDebateStore((state) => state.reset);
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const openSettings = useSettingsStore((state) => state.openSettings);
  const provider = useSettingsStore((state) => state.provider);
  const apiKey = useSettingsStore((state) => state.apiKey);
  const baseUrl = useSettingsStore((state) => state.baseUrl);
  const model = useSettingsStore((state) => state.model);
  const hasApiKey = useSettingsStore((state) => state.hasApiKey);

  const [session, setSession] = useState<DebateSession | null>(null);
  const [toast, setToast] = useState<ToastState>({ visible: false, message: "" });
  const [score, setScore] = useState<number | null>(null);
  const [verdictType, setVerdictType] = useState<VerdictType | null>(null);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [quoteRaw, setQuoteRaw] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [gaugeState, setGaugeState] = useState<RequestPhase>("pending");
  const [typeState, setTypeState] = useState<RequestPhase>("pending");
  const [templateState, setTemplateState] = useState<RequestPhase>("pending");
  const [quoteState, setQuoteState] = useState<RequestPhase>("pending");
  const [analysisState, setAnalysisState] = useState<RequestPhase>("pending");
  const [statusClock, setStatusClock] = useState(Date.now());
  const [scoreStartedAt, setScoreStartedAt] = useState<number | null>(null);
  const [quoteStartedAt, setQuoteStartedAt] = useState<number | null>(null);
  const [analysisStartedAt, setAnalysisStartedAt] = useState<number | null>(null);

  const portraitRef = useRef<HTMLDivElement>(null);
  const squareRef = useRef<HTMLDivElement>(null);
  const landscapeRef = useRef<HTMLDivElement>(null);
  const generationKeyRef = useRef("");

  const isConfigured = hasApiKey();

  useEffect(() => {
    hydrateSettings();
  }, [hydrateSettings]);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const latestSession = pickSessionSnapshot(useDebateStore.getState());

      if (!sessionId) {
        if (isMounted) {
          setSession(latestSession.statement ? latestSession : null);
        }
        return;
      }

      if (latestSession.id === sessionId && latestSession.statement) {
        if (isMounted) {
          setSession(latestSession);
        }
        return;
      }

      const stored = await getDebateSessionWithTimeout(sessionId, 1800);
      if (stored && isMounted) {
        setSession(stored);
        hydrateSession(stored);
      } else if (isMounted) {
        setSession(latestSession.statement ? latestSession : null);
      }
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, [hydrateSession, sessionId]);

  useEffect(() => {
    const loading =
      gaugeState === "pending" ||
      quoteState === "pending" ||
      quoteState === "streaming" ||
      analysisState === "pending";

    if (!loading) {
      return;
    }

    const timer = window.setInterval(() => {
      setStatusClock(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [analysisState, gaugeState, quoteState]);

  useEffect(() => {
    if (!toast.visible) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast({ visible: false, message: "" });
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [toast.visible]);

  const category = useMemo(
    () => (session ? classifyDecision(session.statement) : "general"),
    [session],
  );
  const compressedConversation = useMemo(
    () => (session ? compressConversation(session.statement, session.messages) : ""),
    [session],
  );
  const statementSummary = useMemo(
    () => (session ? summarizeStatement(session.statement, 50) : ""),
    [session],
  );
  const questionSummary = useMemo(
    () => (session ? summarizeDecisionQuestion(session.statement) : ""),
    [session],
  );
  const template = useMemo(
    () => (verdictType ? VERDICT_TEMPLATES[verdictType] : VERDICT_TEMPLATES.UNRESOLVED),
    [verdictType],
  );

  const previewQuote = useMemo(() => {
    if (quoteState !== "streaming") {
      return quote;
    }

    const preview = parseQuoteSelectionPreview(quoteRaw);
    return {
      en: preview.en || quote?.en || "",
      zh: preview.zh || quote?.zh || "",
    };
  }, [quote, quoteRaw, quoteState]);

  const renderVerdictData = useMemo(() => {
    if (score == null || !verdictType) {
      return null;
    }

    const resolvedQuote = quote ?? pickRandomQuote(selectCandidateQuotes(score, category, 3));
    return createVerdictData(
      score,
      verdictType,
      resolvedQuote,
      analysisState === "ready" ? analysis : null,
    );
  }, [analysis, analysisState, category, quote, score, verdictType]);

  const renderSession = useMemo(() => {
    if (!session || !renderVerdictData) {
      return session;
    }

    return {
      ...session,
      verdict: renderVerdictData,
    };
  }, [renderVerdictData, session]);

  const persistVerdict = useCallback(
    async (nextVerdict: VerdictData) => {
      await setVerdict(nextVerdict);
    },
    [setVerdict],
  );

  const requestQuickJudgment = useCallback(
    async (conversation: string, signal: AbortSignal) => {
      const prompt = buildQuickJudgmentPrompt(conversation);
      const result = await createChatCompletion({
        provider,
        apiKey,
        baseUrl,
        model,
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
        stream: false,
        temperature: 0.3,
        timeoutMs: 12000,
        retryCount: 1,
        maxTokens: 20,
        signal,
        purpose: "verdict",
        requestTag: "A",
      });

      return parseQuickJudgment(result.content);
    },
    [apiKey, baseUrl, model, provider],
  );

  const requestQuoteSelection = useCallback(
    async (
      summary: string,
      nextScore: number,
      candidates: [Quote, Quote, Quote],
      signal: AbortSignal,
    ) => {
      const prompt = buildQuoteSelectionPrompt(summary, nextScore, candidates);
      setQuoteRaw("");
      setQuoteState("streaming");
      setQuoteStartedAt(Date.now());

      const result = await createChatCompletion({
        provider,
        apiKey,
        baseUrl,
        model,
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
        stream: true,
        temperature: 0.7,
        timeoutMs: 12000,
        retryCount: 1,
        maxTokens: 120,
        signal,
        purpose: "verdict",
        requestTag: "B",
        onRetry: () => {
          setQuoteRaw("");
        },
        onToken: (token) => {
          setQuoteRaw((current) => current + token);
        },
      });

      return parseQuoteSelection(result.content);
    },
    [apiKey, baseUrl, model, provider],
  );

  const requestDeepAnalysis = useCallback(
    async (conversation: string, signal: AbortSignal) => {
      const prompt = buildDeepAnalysisPrompt(conversation);
      const result = await createChatCompletion({
        provider,
        apiKey,
        baseUrl,
        model,
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user },
        ],
        stream: false,
        temperature: 0.6,
        timeoutMs: 12000,
        retryCount: 1,
        maxTokens: 400,
        signal,
        purpose: "verdict",
        requestTag: "C",
      });

      return parseDeepAnalysis(result.content);
    },
    [apiKey, baseUrl, model, provider],
  );

  useEffect(() => {
    if (!session || generationKeyRef.current === session.id) {
      return;
    }

    generationKeyRef.current = session.id;
    setScore(null);
    setVerdictType(null);
    setQuote(null);
    setQuoteRaw("");
    setAnalysis(null);
    setGaugeState("pending");
    setTypeState("pending");
    setTemplateState("pending");
    setQuoteState("pending");
    setAnalysisState("pending");
    setScoreStartedAt(Date.now());
    setQuoteStartedAt(null);
    setAnalysisStartedAt(Date.now());

    const controller = new AbortController();

    if (!isConfigured) {
      const fallbackQuick = createFallbackQuickJudgment();
      const fallbackQuote = pickRandomQuote(selectCandidateQuotes(fallbackQuick.score, category, 3));

      setScore(fallbackQuick.score);
      setVerdictType(fallbackQuick.verdictType);
      setQuote(fallbackQuote);
      setGaugeState("ready");
      setTypeState("ready");
      setTemplateState("ready");
      setQuoteState("ready");
      setAnalysisState("hidden");
      setScoreStartedAt(null);
      setQuoteStartedAt(null);
      setAnalysisStartedAt(null);
      setToast({ visible: true, message: "未配置模型，已使用本地判决骨架。" });
      void persistVerdict(
        createVerdictData(
          fallbackQuick.score,
          fallbackQuick.verdictType,
          fallbackQuote,
          null,
        ),
      );
      openSettings();
      return () => controller.abort();
    }

    requestQuickJudgment(compressedConversation, controller.signal)
      .then((result) => {
        setScore(result.score);
        setVerdictType(result.verdictType);
        setGaugeState("ready");
        setTypeState("ready");
        setTemplateState("ready");
        setScoreStartedAt(null);

        const candidates = selectCandidateQuotes(result.score, category, 3) as [Quote, Quote, Quote];
        requestQuoteSelection(statementSummary, result.score, candidates, controller.signal)
          .then((selected) => {
            const resolvedQuote = { en: selected.en, zh: selected.zh };
            setQuote(resolvedQuote);
            setQuoteState("ready");
            setQuoteStartedAt(null);
            void persistVerdict(
              createVerdictData(result.score, result.verdictType, resolvedQuote, null),
            );
          })
          .catch(() => {
            const fallbackQuote = pickRandomQuote(candidates);
            setQuote(fallbackQuote);
            setQuoteState("ready");
            setQuoteStartedAt(null);
            void persistVerdict(
              createVerdictData(result.score, result.verdictType, fallbackQuote, null),
            );
          });
      })
      .catch(() => {
        const fallbackQuick = createFallbackQuickJudgment();
        const fallbackQuote = pickRandomQuote(selectCandidateQuotes(fallbackQuick.score, category, 3));

        setScore(fallbackQuick.score);
        setVerdictType(fallbackQuick.verdictType);
        setQuote(fallbackQuote);
        setGaugeState("ready");
        setTypeState("ready");
        setTemplateState("ready");
        setQuoteState("ready");
        setScoreStartedAt(null);
        setQuoteStartedAt(null);
        void persistVerdict(
          createVerdictData(
            fallbackQuick.score,
            fallbackQuick.verdictType,
            fallbackQuote,
            null,
          ),
        );
      });

    requestDeepAnalysis(compressedConversation, controller.signal)
      .then((result) => {
        setAnalysis(result);
        setAnalysisState("ready");
        setAnalysisStartedAt(null);
      })
      .catch(() => {
        setAnalysisState("hidden");
        setAnalysisStartedAt(null);
      });

    return () => controller.abort();
  }, [
    category,
    compressedConversation,
    isConfigured,
    openSettings,
    persistVerdict,
    requestDeepAnalysis,
    requestQuickJudgment,
    requestQuoteSelection,
    session,
    statementSummary,
  ]);

  const gaugeProgressText =
    scoreStartedAt && statusClock - scoreStartedAt > 15000
      ? "Taking longer than usual..."
      : "Deliberating...";
  const quoteProgressText =
    quoteStartedAt && statusClock - quoteStartedAt > 15000
      ? "Taking longer than usual..."
      : "Writing verdict...";
  const analysisProgressText =
    analysisStartedAt && statusClock - analysisStartedAt > 15000
      ? "Taking longer than usual..."
      : "Examining arguments...";

  const shareRefs = useMemo(
    () => ({
      portrait: portraitRef,
      square: squareRef,
      landscape: landscapeRef,
    }),
    [],
  );

  async function handleDownload(variant: ShareImageVariant) {
    const target = shareRefs[variant].current;
    if (!target || !renderSession) {
      return;
    }

    try {
      await downloadElementAsPng(target, variant, `verdict-${Date.now()}-${variant}.png`);
      setToast({ visible: true, message: "判决书已封存" });
    } catch (error) {
      setToast({
        visible: true,
        message: error instanceof Error ? error.message : "生成长图失败。",
      });
    }
  }

  async function handleShare() {
    if (!renderSession?.verdict || !portraitRef.current) {
      return;
    }

    const shareUrl = getPublicAppUrl();
    const summary = `${renderSession.verdict.oneLiner || renderSession.verdict.sentenceZh} · 成立度 ${renderSession.verdict.convictionScore}`;
    const shareText = `${summary}\n${shareUrl}`;
    const shareTitle = "反方辩友判决书";

    try {
      const file = await generatePngFile(
        portraitRef.current,
        "portrait",
        `verdict-share-${Date.now()}.png`,
      );
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
          files: [file],
        });
        setToast({ visible: true, message: "截图与链接已调起分享" });
        return;
      }
    } catch {
      // fall through to plain share
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setToast({ visible: true, message: "链接已调起分享" });
        return;
      } catch {
        // fall through
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setToast({ visible: true, message: "链接已复制，请手动发送截图" });
    } catch {
      await downloadElementAsPng(
        portraitRef.current,
        "portrait",
        `verdict-share-${Date.now()}.png`,
      );
      setToast({ visible: true, message: "当前浏览器不支持系统分享，已下载截图" });
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden px-5 pb-24 pt-28 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,0,0,0.22),transparent_34%)]" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <VerdictSkeleton verdictNumber={session?.verdictNumber ?? "------"}>
          <div className="mt-10">
            <ConvictionGauge
              progressText={gaugeProgressText}
              score={score ?? 0}
              state={gaugeState === "ready" ? "ready" : "pending"}
              verdictType={verdictType ?? "UNRESOLVED"}
            />
          </div>

          <VerdictTypeLabel
            label={template.verdictLabel}
            labelZh={template.verdictLabelZh}
            state={typeState === "ready" ? "ready" : "pending"}
            verdictType={verdictType}
          />

          {questionSummary ? <QuestionSummary summary={questionSummary} /> : null}

          <VerdictTemplate
            closing={template.closing}
            closingZh={template.closingZh}
            opening={template.opening}
            openingZh={template.openingZh}
            state={templateState === "ready" ? "ready" : "pending"}
          />

          <QuoteDisplay
            en={previewQuote?.en ?? ""}
            progressText={quoteProgressText}
            state={
              quoteState === "streaming"
                ? "streaming"
                : quoteState === "ready"
                  ? "ready"
                  : "pending"
            }
            zh={previewQuote?.zh ?? ""}
          />

          <FlawsAndPillars
            fatalFlaws={analysis?.fatalFlaws ?? []}
            progressText={analysisProgressText}
            solidPillars={analysis?.solidPillars ?? []}
            state={
              analysisState === "ready"
                ? "ready"
                : analysisState === "hidden"
                  ? "hidden"
                  : "pending"
            }
          />
        </VerdictSkeleton>

        {renderSession ? (
          <>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
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
              <Link
                className="quill-cursor inline-flex items-center gap-2 border border-devil-line px-5 py-4 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-muted transition-colors hover:border-devil-gold hover:text-devil-ivory"
                href="/trial/single"
                onClick={() => reset()}
              >
                <RefreshCw className="size-4" />
                再辩一场
              </Link>
              <div className="flex items-center gap-2">
                <button
                  className="quill-cursor border border-devil-line px-4 py-4 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-devil-muted transition-colors hover:border-devil-gold hover:text-devil-ivory"
                  onClick={() => void handleDownload("square")}
                  type="button"
                >
                  方版
                </button>
                <button
                  className="quill-cursor border border-devil-line px-4 py-4 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-devil-muted transition-colors hover:border-devil-gold hover:text-devil-ivory"
                  onClick={() => void handleDownload("landscape")}
                  type="button"
                >
                  横版
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                className="inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-devil-muted transition-colors hover:text-devil-gold"
                href={`/history?session=${renderSession.id}`}
              >
                <History className="size-4" />
                查看完整对话
                <ExternalLink className="size-4" />
              </Link>
            </div>
          </>
        ) : null}
      </div>

      {renderSession ? (
        <div className="pointer-events-none fixed left-[-99999px] top-0 opacity-0">
          <div ref={portraitRef}>
            <ShareableImage session={renderSession} variant="portrait" />
          </div>
          <div ref={squareRef}>
            <ShareableImage session={renderSession} variant="square" />
          </div>
          <div ref={landscapeRef}>
            <ShareableImage session={renderSession} variant="landscape" />
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
