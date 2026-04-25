"use client";

import { animate, motion } from "framer-motion";
import { AlertTriangle, BadgeCheck, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  VerdictFlaw,
  VerdictPillar,
  VerdictStatus,
} from "@/lib/store/debate";

type ScoreBlock = {
  score: number;
  verdict: VerdictStatus;
};

type CoreBlock = {
  sentence: string;
  sentenceZh: string;
  oneLiner: string;
};

type AnalysisBlock = {
  fatalFlaws: VerdictFlaw[];
  solidPillars: VerdictPillar[];
};

type RequestState = {
  status: "idle" | "loading" | "success" | "error";
  startedAt: number | null;
  errorMessage?: string;
};

type VerdictCardProps = {
  verdictNumber: string;
  createdAt?: number | null;
  nowTs: number;
  scoreBlock: ScoreBlock | null;
  coreBlock: CoreBlock | null;
  coreRaw: string;
  analysisBlock: AnalysisBlock | null;
  scoreRequest: RequestState;
  coreRequest: RequestState;
  analysisRequest: RequestState;
  onRetryCore: () => void;
  onRetryAnalysis: () => void;
};

function getVerdictTone(score: number) {
  if (score < 40) {
    return {
      color: "#8B0000",
      label: "CONVICTED",
      zh: "决定不成立",
    };
  }

  if (score < 70) {
    return {
      color: "#B8860B",
      label: "UNRESOLVED",
      zh: "争议未决",
    };
  }

  return {
    color: "#E8E6E3",
    label: "ACQUITTED",
    zh: "决定成立",
  };
}

function buildStatusText(state: RequestState, normalText: string, nowTs: number) {
  if (state.status === "loading") {
    if (state.startedAt && nowTs - state.startedAt > 15000) {
      return "Taking longer than usual...";
    }
    return normalText;
  }

  return "";
}

function RotatingScale() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      className="grid place-items-center"
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
    >
      <svg className="size-24 text-devil-gold/70" fill="none" viewBox="0 0 64 64">
        <path
          d="M32 8v44M16 20h32M32 14 17 20 8 40h18l-9-20M32 14 47 20l-9 20h18l-9-20M22 52h20M26 58h12"
          stroke="currentColor"
        />
      </svg>
    </motion.div>
  );
}

function Gauge({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = 110;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;
  const tone = getVerdictTone(score);

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 2,
      onUpdate: (value) => setDisplayScore(Math.round(value)),
    });

    return () => controls.stop();
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <svg className="h-52 w-full max-w-[320px]" viewBox="0 0 280 180">
        <path
          d="M30 140a110 110 0 0 1 220 0"
          fill="none"
          stroke="rgba(184,134,11,0.12)"
          strokeLinecap="round"
          strokeWidth="10"
        />
        <motion.path
          animate={{ strokeDashoffset: circumference - progress }}
          d="M30 140a110 110 0 0 1 220 0"
          fill="none"
          initial={{ strokeDashoffset: circumference }}
          stroke={tone.color}
          strokeDasharray={circumference}
          strokeLinecap="round"
          strokeWidth="10"
          transition={{ duration: 2, ease: "easeOut" }}
        />
      </svg>
      <div className="-mt-10 text-center">
        <p className="font-display text-7xl leading-none" style={{ color: tone.color }}>
          {displayScore}
        </p>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.32em] text-devil-muted">
          决定成立度
        </p>
        <p className="mt-3 font-display text-3xl tracking-[0.06em]" style={{ color: tone.color }}>
          {tone.label}
        </p>
        <p className="mt-1 font-serif-cn text-lg text-devil-ivory/80">{tone.zh}</p>
      </div>
    </div>
  );
}

export function VerdictCard({
  verdictNumber,
  createdAt,
  nowTs,
  scoreBlock,
  coreBlock,
  coreRaw,
  analysisBlock,
  scoreRequest,
  coreRequest,
  analysisRequest,
  onRetryCore,
  onRetryAnalysis,
}: VerdictCardProps) {
  const createdDate = createdAt ? new Date(createdAt) : null;
  const scoreTone = useMemo(
    () => getVerdictTone(scoreBlock?.score ?? 50),
    [scoreBlock?.score],
  );
  const topHint =
    scoreBlock && scoreBlock.score < 20
      ? "Consider sleeping on this. · 先睡一觉再决定吧。"
      : scoreBlock && scoreBlock.score > 85
        ? "The floor is yours. · 去做吧。"
        : null;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="relative mx-auto w-full max-w-[560px] border border-devil-gold bg-devil-bg-soft/95 px-6 py-10 shadow-[0_0_100px_rgba(139,0,0,0.14)] sm:px-[60px]"
      initial={{ opacity: 0, y: 48 }}
      transition={{ duration: 0.75, ease: "easeOut" }}
    >
      {topHint ? (
        <p className="mb-4 text-center font-mono text-[0.6rem] uppercase tracking-[0.28em] text-devil-muted/30">
          {topHint}
        </p>
      ) : null}

      <div className="flex flex-col items-center">
        <svg className="size-12 text-devil-gold" fill="none" viewBox="0 0 64 64">
          <path
            d="M32 8v44M16 20h32M32 14 17 20 8 40h18l-9-20M32 14 47 20l-9 20h18l-9-20M22 52h20M26 58h12"
            stroke="currentColor"
          />
        </svg>
        <p className="mt-5 text-center font-mono text-[0.65rem] uppercase tracking-[0.3em] text-devil-gold">
          COURT OF COGNITIVE CLARITY · VERDICT NO. {verdictNumber}
        </p>
      </div>

      <div className="my-6 h-px bg-gradient-to-r from-transparent via-devil-gold/60 to-transparent" />

      <section>
        <h1 className="text-center font-display text-[44px] leading-none text-devil-ivory">
          The Verdict
        </h1>
        <p className="mt-2 text-center font-serif-cn text-lg text-devil-ivory/80">判决如下</p>
      </section>

      <section className="mt-10 min-h-[280px]">
        {scoreBlock ? (
          <Gauge score={scoreBlock.score} />
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <RotatingScale />
            <p className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-devil-muted">
              {buildStatusText(scoreRequest, "Deliberating...", nowTs)}
            </p>
          </div>
        )}
      </section>

      <section className="mt-12 min-h-[180px] text-center">
        {!coreBlock && coreRequest.status !== "error" ? (
          <div className="space-y-4">
            <div className="mx-auto h-5 w-4/5 animate-pulse bg-devil-line/60" />
            <div className="mx-auto h-5 w-3/5 animate-pulse bg-devil-line/50" />
            <div className="mx-auto mt-8 h-4 w-2/3 animate-pulse bg-devil-line/40" />
            <p className="pt-2 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-devil-muted">
              {buildStatusText(coreRequest, "Writing verdict...", nowTs)}
            </p>
            {coreRaw ? (
              <p className="mx-auto max-w-xl whitespace-pre-wrap border-l border-devil-red/40 pl-4 text-left font-body-cn text-sm leading-7 text-devil-ivory/80">
                {coreRaw}
              </p>
            ) : null}
          </div>
        ) : null}

        {coreBlock ? (
          <>
            <p className="font-display text-[28px] leading-tight text-devil-ivory">
              “{coreBlock.sentence || "The court has reached its conclusion."}”
            </p>
            <p className="mt-4 font-body-cn text-base leading-8 text-devil-muted">
              {coreBlock.sentenceZh || "判词落下，余音未散。"}
            </p>
            <p className="mt-4 font-serif-cn text-lg leading-8 text-devil-ivory/90">
              {coreBlock.oneLiner || "真正的决定，经得住最坏的提问。"}
            </p>
          </>
        ) : null}

        {coreRequest.status === "error" ? (
          <div className="rounded-sm border border-devil-red/35 bg-devil-bg/40 px-5 py-6">
            <p className="font-display text-2xl text-devil-ivory">判决官此时沉默不语</p>
            <p className="mt-3 font-body-cn text-sm leading-7 text-devil-muted">
              {coreRequest.errorMessage || "核心判词暂时未能返回。"}
            </p>
            <button
              className="quill-cursor mt-5 inline-flex items-center gap-2 border border-devil-red/45 px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-devil-red transition-colors hover:bg-devil-red hover:text-devil-ivory"
              onClick={onRetryCore}
              type="button"
            >
              <RefreshCw className="size-3.5" />
              重试判词
            </button>
          </div>
        ) : null}
      </section>

      <section className="mt-12 min-h-[220px]">
        {!analysisBlock && analysisRequest.status !== "error" ? (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="h-4 w-32 animate-pulse bg-devil-line/60" />
              <div className="h-16 animate-pulse bg-devil-line/45" />
              <div className="h-16 animate-pulse bg-devil-line/35" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-32 animate-pulse bg-devil-line/60" />
              <div className="h-16 animate-pulse bg-devil-line/45" />
              <div className="h-16 animate-pulse bg-devil-line/35" />
            </div>
            <p className="sm:col-span-2 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-devil-muted">
              {buildStatusText(analysisRequest, "Examining arguments...", nowTs)}
            </p>
          </div>
        ) : null}

        {analysisBlock ? (
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-devil-red">
                <AlertTriangle className="size-4" />
                <h2 className="font-mono text-xs uppercase tracking-[0.26em]">
                  Fatal Flaws · 致命漏洞
                </h2>
              </div>
              <div className="mt-4 space-y-3">
                {analysisBlock.fatalFlaws.map((item, index) => (
                  <div className="border-l border-devil-red pl-4" key={`${item.flaw}-${index}`}>
                    <div className="flex items-start gap-2">
                      <p className="flex-1 font-body-cn text-sm leading-7 text-devil-ivory">
                        {item.flaw}
                      </p>
                      {item.weight === "HIGH" ? (
                        <span className="mt-1 text-devil-red">
                          <Sparkles className="size-4" />
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-devil-muted">
                      {item.weight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-devil-gold">
                <BadgeCheck className="size-4" />
                <h2 className="font-mono text-xs uppercase tracking-[0.26em]">
                  Solid Pillars · 坚固堡垒
                </h2>
              </div>
              <div className="mt-4 space-y-3">
                {analysisBlock.solidPillars.map((item, index) => (
                  <div className="border-l border-devil-gold pl-4" key={`${item.pillar}-${index}`}>
                    <p className="font-body-cn text-sm leading-7 text-devil-ivory">{item.pillar}</p>
                    <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-devil-muted">
                      {item.strength}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {analysisRequest.status === "error" ? (
          <div className="text-center">
            <button
              className="quill-cursor inline-flex items-center gap-2 border border-devil-line px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-devil-muted transition-colors hover:border-devil-gold hover:text-devil-ivory"
              onClick={onRetryAnalysis}
              type="button"
            >
              <RefreshCw className="size-3.5" />
              重试详细分析
            </button>
          </div>
        ) : null}
      </section>

      <section className="mt-12 flex items-end justify-between gap-4">
        <div className="rounded-full border border-devil-red/35 px-4 py-2 font-body-cn text-sm text-devil-muted">
          {createdDate ? createdDate.toLocaleDateString("zh-CN") : "审理中"}
        </div>
        <div className="flex items-end gap-3">
          <svg className="size-12 text-devil-red/45" fill="none" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="28" stroke="currentColor" />
            <path
              d="M24 42c8-10 24-12 32 0M29 31c8 5 14 5 22 0M31 50c7 4 11 4 18 0"
              stroke="currentColor"
            />
          </svg>
          <div className="text-right">
            <p className="font-body-cn text-sm text-devil-muted">
              {scoreBlock ? `评分基调：${scoreTone.zh}` : "法庭仍在落笔。"}
            </p>
            <p
              className="mt-2 font-display text-2xl"
              style={{ color: scoreTone.color }}
            >
              — The Devil&apos;s Advocate
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
