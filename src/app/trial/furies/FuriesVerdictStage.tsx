"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, ExternalLink, History, RefreshCw, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConvergenceDivergence } from "@/components/verdict/furies/ConvergenceDivergence";
import { FinalStatement } from "@/components/verdict/furies/FinalStatement";
import { FuriesSkeleton } from "@/components/verdict/furies/FuriesSkeleton";
import { JuryPanel } from "@/components/verdict/furies/JuryPanel";
import { QuestionSummary } from "@/components/verdict/QuestionSummary";
import { ShareableFuriesImage } from "@/components/verdict/furies/ShareableFuriesImage";
import { FlawsAndPillars } from "@/components/verdict/FlawsAndPillars";
import {
  downloadElementAsPng,
  generatePngFile,
  type ShareImageVariant,
} from "@/lib/image/generateImage";
import { createChatCompletion } from "@/lib/llm/client";
import { getPublicAppUrl } from "@/lib/share/appUrl";
import {
  buildDeepAnalysisPrompt,
  buildFuriesConvergencePrompt,
  buildQuickJudgmentPrompt,
  parseConvergenceDivergence,
  parseDeepAnalysis,
  parseQuickJudgment,
} from "@/lib/llm/verdictPrompt";
import { compressConversation } from "@/lib/verdict/compress";
import { selectFuryRemark } from "@/lib/verdict/furiesRemarks";
import { deriveRoleScores } from "@/lib/verdict/furiesScoring";
import { FURIES_TEMPLATE } from "@/lib/verdict/furiesTemplate";
import { scoreToBand } from "@/lib/verdict/quoteSelector";
import { summarizeDecisionQuestion } from "@/lib/verdict/questionSummary";
import type { VerdictType } from "@/lib/verdict/templates";
import type { VerdictData } from "@/lib/store/debate";
import { useDebateStore } from "@/lib/store/debate";
import { useSettingsStore } from "@/lib/store/settings";

type JuryCard = {
  id: string;
  score: number;
  zh: string;
  en: string;
  verdict: "agree" | "oppose" | "neutral";
};

type ToastState = {
  visible: boolean;
  message: string;
};

function fallbackQuickJudgment() {
  return { score: 50, verdictType: "UNRESOLVED" as VerdictType };
}

export function FuriesVerdictStage({ onRestart }: { onRestart: () => void }) {
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

  const [toast, setToast] = useState<ToastState>({ visible: false, message: "" });
  const [statusClock, setStatusClock] = useState(Date.now());
  const [score, setScore] = useState<number | null>(null);
  const [verdictType, setVerdictType] = useState<VerdictType | null>(null);
  const [juryCards, setJuryCards] = useState<JuryCard[]>([]);
  const [juryState, setJuryState] = useState<"pending" | "ready">("pending");
  const [consensusState, setConsensusState] = useState<"pending" | "ready">("pending");
  const [analysisState, setAnalysisState] = useState<"pending" | "ready" | "hidden">("pending");
  const [convergence, setConvergence] = useState("");
  const [divergence, setDivergence] = useState("");
  const [analysis, setAnalysis] = useState<{ fatalFlaws: string[]; solidPillars: string[] } | null>(null);
  const [consensusStartedAt, setConsensusStartedAt] = useState<number | null>(null);
  const [analysisStartedAt, setAnalysisStartedAt] = useState<number | null>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const squareRef = useRef<HTMLDivElement>(null);
  const landscapeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hydrateSettings();
  }, [hydrateSettings]);

  useEffect(() => {
    const loading = consensusState === "pending" || analysisState === "pending";
    if (!loading) {
      return;
    }

    const timer = window.setInterval(() => setStatusClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [analysisState, consensusState]);

  useEffect(() => {
    if (!toast.visible) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast({ visible: false, message: "" });
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [toast.visible]);

  const compressed = useMemo(() => compressConversation(statement, messages), [messages, statement]);
  const questionSummary = useMemo(() => summarizeDecisionQuestion(statement), [statement]);
  const band = useMemo(() => scoreToBand(score ?? 50), [score]);
  const finalStatement = FURIES_TEMPLATE.closingByScoreBand[band];

  const currentVerdict = useMemo<VerdictData | null>(() => {
    if (score == null || !verdictType) {
      return null;
    }

    return {
      convictionScore: score,
      verdict: verdictType,
      fatalFlaws: (analysis?.fatalFlaws ?? []).map((item, index) => ({
        flaw: item,
        weight: index === 0 ? ("HIGH" as "HIGH" | "MEDIUM") : ("MEDIUM" as "HIGH" | "MEDIUM"),
      })),
      solidPillars: (analysis?.solidPillars ?? []).map((item, index) => ({
        pillar: item,
        strength:
          index === 0
            ? ("STRONG" as "STRONG" | "STABLE")
            : ("STABLE" as "STRONG" | "STABLE"),
      })),
      sentence: finalStatement.en,
      sentenceZh: finalStatement.zh,
      oneLiner: convergence || finalStatement.zh,
      advocateRemark: divergence || finalStatement.zh,
      meta: {
        source: analysisState === "ready" ? "assembled" : "request-a",
        status: analysisState === "ready" ? "final" : "partial",
        generatedAt: Date.now(),
      },
    };
  }, [analysis, analysisState, divergence, finalStatement.en, finalStatement.zh, score, verdictType, convergence]);

  useEffect(() => {
    if (!statement) {
      return;
    }

    const controller = new AbortController();
    const localQuick = fallbackQuickJudgment();

    setConsensusStartedAt(Date.now());
    setAnalysisStartedAt(Date.now());

    console.log("[Furies F1] sent at", Date.now());
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
      requestTag: "Furies F1",
    })
      .then(async (response) => {
        const parsed = parseQuickJudgment(response.content);
        console.log("[Furies F1] received at", Date.now());
        return parsed;
      })
      .catch(() => localQuick)
      .then(async (quick) => {
        setScore(quick.score);
        setVerdictType(quick.verdictType as VerdictType);
        const roleScores = deriveRoleScores(quick.score);
        const nextCards = (Object.keys(roleScores) as Array<keyof typeof roleScores>).map((role) => {
          const remark = selectFuryRemark(role, scoreToBand(roleScores[role]));
          return {
            id: role,
            score: roleScores[role],
            zh: remark.zh,
            en: remark.en,
            verdict: remark.verdict,
          };
        });
        setJuryCards(nextCards);
        setJuryState("ready");

        const summary = nextCards
          .map((card) => `${card.id}:${card.verdict}:${card.score}:${card.zh}`)
          .join("\n");

        console.log("[Furies F2] sent at", Date.now());
        return createChatCompletion({
          provider,
          apiKey,
          baseUrl,
          model,
          messages: [
            { role: "system", content: buildFuriesConvergencePrompt(summary).system },
            { role: "user", content: buildFuriesConvergencePrompt(summary).user },
          ],
          timeoutMs: 12000,
          retryCount: 1,
          maxTokens: 150,
          temperature: 0.45,
          signal: controller.signal,
          purpose: "verdict",
          requestTag: "Furies F2",
          stream: true,
        })
          .then((response) => {
            console.log("[Furies F2] received at", Date.now());
            const parsed = parseConvergenceDivergence(response.content);
            setConvergence(
              parsed.convergence || FURIES_TEMPLATE.fallbackConsensus[scoreToBand(quick.score)].convergence,
            );
            setDivergence(
              parsed.divergence || FURIES_TEMPLATE.fallbackConsensus[scoreToBand(quick.score)].divergence,
            );
            setConsensusState("ready");
            setConsensusStartedAt(null);
          })
          .catch(() => {
            const fallback = FURIES_TEMPLATE.fallbackConsensus[scoreToBand(quick.score)];
            setConvergence(fallback.convergence);
            setDivergence(fallback.divergence);
            setConsensusState("ready");
            setConsensusStartedAt(null);
          });
      });

    console.log("[Furies F3] sent at", Date.now());
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
      requestTag: "Furies F3",
    })
      .then((response) => {
        console.log("[Furies F3] received at", Date.now());
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
  }, [apiKey, baseUrl, compressed, model, provider, statement]);

  useEffect(() => {
    if (!currentVerdict) {
      return;
    }
    void setVerdict(currentVerdict);
  }, [currentVerdict, setVerdict]);

  const progressText =
    consensusStartedAt && statusClock - consensusStartedAt > 12000
      ? "Taking longer than usual..."
      : "Summarizing discord...";
  const analysisText =
    analysisStartedAt && statusClock - analysisStartedAt > 12000
      ? "Taking longer than usual..."
      : "Examining arguments...";

  async function handleDownload(variant: ShareImageVariant) {
    const targetRef =
      variant === "portrait" ? portraitRef : variant === "square" ? squareRef : landscapeRef;
    if (!targetRef.current || score == null || !verdictType) {
      return;
    }
    await downloadElementAsPng(targetRef.current, variant, `furies-verdict-${Date.now()}-${variant}.png`);
    setToast({ visible: true, message: "合议报告已封存" });
  }

  async function handleShare() {
    if (!portraitRef.current) {
      return;
    }

    const shareUrl = getPublicAppUrl();
    const text = `${FURIES_TEMPLATE.reportTitleZh} ? ${convergence || "??????"}`;

    try {
      const file = await generatePngFile(
        portraitRef.current,
        "portrait",
        `furies-share-${Date.now()} .png`.replace(' .png', '.png'),
      );
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "???????",
          text: `${text}
${shareUrl}`,
          url: shareUrl,
          files: [file],
        });
        return;
      }
    } catch {
      // fall through to plain share
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: "???????",
          text: `${text}
${shareUrl}`,
          url: shareUrl,
        });
        return;
      } catch {
        // fall through
      }
    }

    await navigator.clipboard.writeText(`${text}
${shareUrl}`);
    setToast({ visible: true, message: "?????????" });
  }

  return (
    <section className="relative min-h-screen overflow-hidden px-5 pb-24 pt-28 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,0,0,0.18),transparent_34%)]" />
      <div className="relative z-10">
        <FuriesSkeleton verdictNumber={verdictNumber}>
          <JuryPanel jurors={juryCards} state={juryState} />
          <QuestionSummary summary={questionSummary} />
          <ConvergenceDivergence
            convergence={convergence}
            divergence={divergence}
            progressText={progressText}
            state={consensusState}
          />
          <FlawsAndPillars
            fatalFlaws={analysis?.fatalFlaws ?? []}
            progressText={analysisText}
            solidPillars={analysis?.solidPillars ?? []}
            state={analysisState}
          />
          <FinalStatement en={finalStatement.en} zh={finalStatement.zh} />
        </FuriesSkeleton>

        <div className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-center gap-3">
        <button
          className="quill-cursor inline-flex items-center gap-2 bg-devil-red px-5 py-4 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-ivory transition-colors hover:bg-[#a50000]"
          onClick={() => void handleDownload("portrait")}
          type="button"
        >
          <Download className="size-4" />
          下载合议报告
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
            reset("furies");
            onRestart();
          }}
          type="button"
        >
          <RefreshCw className="size-4" />
          再辩一场
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

      {score != null && verdictType ? (
        <div className="pointer-events-none fixed left-[-99999px] top-0 opacity-0">
          <div ref={portraitRef}>
            <ShareableFuriesImage
              convergence={convergence || FURIES_TEMPLATE.fallbackConsensus[band].convergence}
              divergence={divergence || FURIES_TEMPLATE.fallbackConsensus[band].divergence}
              fatalFlaws={analysis?.fatalFlaws ?? []}
              finalStatementZh={finalStatement.zh}
              jurors={juryCards}
              score={score}
              solidPillars={analysis?.solidPillars ?? []}
              statement={statement}
              variant="portrait"
              verdictLabel={verdictType}
              verdictNumber={verdictNumber}
            />
          </div>
          <div ref={squareRef}>
            <ShareableFuriesImage
              convergence={convergence || FURIES_TEMPLATE.fallbackConsensus[band].convergence}
              divergence={divergence || FURIES_TEMPLATE.fallbackConsensus[band].divergence}
              fatalFlaws={analysis?.fatalFlaws ?? []}
              finalStatementZh={finalStatement.zh}
              jurors={juryCards}
              score={score}
              solidPillars={analysis?.solidPillars ?? []}
              statement={statement}
              variant="square"
              verdictLabel={verdictType}
              verdictNumber={verdictNumber}
            />
          </div>
          <div ref={landscapeRef}>
            <ShareableFuriesImage
              convergence={convergence || FURIES_TEMPLATE.fallbackConsensus[band].convergence}
              divergence={divergence || FURIES_TEMPLATE.fallbackConsensus[band].divergence}
              fatalFlaws={analysis?.fatalFlaws ?? []}
              finalStatementZh={finalStatement.zh}
              jurors={juryCards}
              score={score}
              solidPillars={analysis?.solidPillars ?? []}
              statement={statement}
              variant="landscape"
              verdictLabel={verdictType}
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
