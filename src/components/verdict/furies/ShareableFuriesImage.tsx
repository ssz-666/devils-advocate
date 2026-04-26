"use client";

import { ShareQrCard } from "@/components/verdict/ShareQrCard";
import { FURY_PERSONAS } from "@/lib/llm/prompts";
import type { ShareImageVariant } from "@/lib/image/generateImage";
import { getPublicAppHost, getPublicAppUrl } from "@/lib/share/appUrl";
import { summarizeDecisionQuestion } from "@/lib/verdict/questionSummary";

type ShareableFuriesImageProps = {
  variant: ShareImageVariant;
  statement: string;
  score: number;
  verdictLabel: string;
  jurors: Array<{ id: string; score: number; zh: string }>;
  convergence: string;
  divergence: string;
  verdictNumber: string;
  finalStatementZh?: string;
  fatalFlaws?: string[];
  solidPillars?: string[];
};

const sizeClasses: Record<ShareImageVariant, string> = {
  portrait: "h-[1920px] w-[1080px]",
  square: "h-[1080px] w-[1080px]",
  landscape: "h-[900px] w-[1600px]",
};

const outerPadding: Record<ShareImageVariant, string> = {
  portrait: "px-14 py-10",
  square: "px-10 py-8",
  landscape: "px-12 py-8",
};

export function ShareableFuriesImage({
  variant,
  statement,
  score,
  verdictLabel,
  jurors,
  convergence,
  divergence,
  verdictNumber,
  finalStatementZh,
  fatalFlaws = [],
  solidPillars = [],
}: ShareableFuriesImageProps) {
  const questionSummary = summarizeDecisionQuestion(statement);
  const publicAppUrl = getPublicAppUrl();
  const publicAppHost = getPublicAppHost();

  return (
    <div
      className={`${sizeClasses[variant]} ${outerPadding[variant]} relative overflow-hidden bg-devil-bg text-devil-ivory`}
      style={{
        fontFamily: "var(--font-body-cn), 'LXGW WenKai', 'Source Han Serif SC', serif",
      }}
    >
      <div className="noise-texture absolute inset-0 opacity-[0.05] mix-blend-screen" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,0,0,0.22),transparent_34%),radial-gradient(circle_at_15%_25%,rgba(184,134,11,0.06),transparent_25%),radial-gradient(circle_at_85%_22%,rgba(184,134,11,0.05),transparent_22%)]" />
      <div className="absolute inset-[28px] border border-devil-gold/85" />

      <div className="absolute inset-[48px] opacity-35">
        <svg className="h-full w-full" fill="none" viewBox="0 0 1200 1800">
          <circle cx="600" cy="760" r="340" stroke="rgba(184,134,11,0.08)" />
          <circle cx="600" cy="760" r="240" stroke="rgba(184,134,11,0.1)" />
          <path
            d="M250 1390h700M350 1450h500M600 220v320M600 1080v260"
            stroke="rgba(184,134,11,0.08)"
          />
        </svg>
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <section className="text-center">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.42em] text-devil-gold">
            FIVE FURIES · JURY DELIBERATION REPORT · NO. {verdictNumber}
          </p>
          <h1 className="mt-10 font-display text-[74px] leading-none text-devil-ivory">
            JURY REPORT
          </h1>
          <p className="mt-4 font-serif-cn text-[30px] text-devil-ivory/76">陪审团合议报告</p>
        </section>

        <section className="mt-8 border border-devil-line bg-devil-bg-soft/45 px-7 py-6 text-center">
          <p className="font-mono text-[0.82rem] uppercase tracking-[0.38em] text-devil-gold">
            QUESTION SUMMARY · 问题概括
          </p>
          <p className="mt-5 font-body-cn text-[24px] leading-[1.8] text-devil-ivory">
            {questionSummary}
          </p>
        </section>

        <section className="mt-10 grid grid-cols-5 gap-4">
          {FURY_PERSONAS.map((persona) => {
            const row = jurors.find((item) => item.id === persona.id);
            return (
              <div
                className="border border-devil-line bg-devil-bg-soft/55 px-3 py-4 text-center"
                key={persona.id}
              >
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-devil-muted">
                  {persona.enName}
                </p>
                <p className="mt-3 font-display text-[42px] text-devil-ivory">{row?.score ?? "—"}</p>
                <p className="mt-3 font-body-cn text-[15px] leading-[1.7] text-devil-ivory/82">
                  {row?.zh ?? "评议尚未落笔。"}
                </p>
              </div>
            );
          })}
        </section>

        <section className="mt-10 grid grid-cols-[0.95fr_1.05fr] items-center gap-8">
          <div className="text-center">
            <p className="font-display text-[180px] leading-none text-devil-gold">{score}</p>
            <p className="mt-4 font-mono text-[0.9rem] uppercase tracking-[0.4em] text-devil-muted">
              TOTAL SCORE
            </p>
            <p className="mt-5 font-display text-[54px] text-devil-ivory">{verdictLabel}</p>
          </div>

          <div className="space-y-6 border-l border-devil-line/70 pl-8">
            <div>
              <p className="font-mono text-[0.76rem] uppercase tracking-[0.32em] text-devil-red">
                POINT OF CONVERGENCE
              </p>
              <p className="mt-4 font-serif-cn text-[34px] leading-[1.7] text-devil-ivory">
                {convergence}
              </p>
            </div>
            <div>
              <p className="font-mono text-[0.76rem] uppercase tracking-[0.32em] text-devil-gold">
                POINT OF DIVERGENCE
              </p>
              <p className="mt-4 font-body-cn text-[24px] leading-[1.8] text-devil-muted">
                {divergence}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 border border-devil-line bg-devil-bg-soft/45 px-7 py-6 text-center">
          <p className="font-mono text-[0.82rem] uppercase tracking-[0.38em] text-devil-gold">
            FINAL STATEMENT
          </p>
          <p className="mt-5 font-serif-cn text-[34px] leading-[1.8] text-devil-ivory">
            {finalStatementZh || "五种敌意已经到齐，剩下的只是你要不要承认它们。"}
          </p>
        </section>

        {fatalFlaws.length > 0 || solidPillars.length > 0 ? (
          <section className="mt-12 grid grid-cols-2 gap-8">
            <div>
              <p className="font-mono text-[0.78rem] uppercase tracking-[0.32em] text-devil-red">
                Fatal Flaws · 致命漏洞
              </p>
              <div className="mt-5 space-y-4">
                {fatalFlaws.slice(0, 3).map((item, index) => (
                  <div className="border-l border-devil-red pl-4" key={`${item}-${index}`}>
                    <p className="font-body-cn text-[22px] leading-[1.8] text-devil-ivory">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono text-[0.78rem] uppercase tracking-[0.32em] text-devil-gold">
                Solid Pillars · 坚固堡垒
              </p>
              <div className="mt-5 space-y-4">
                {solidPillars.slice(0, 3).map((item, index) => (
                  <div className="border-l border-devil-gold pl-4" key={`${item}-${index}`}>
                    <p className="font-body-cn text-[22px] leading-[1.8] text-devil-ivory">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="mt-auto grid grid-cols-[1fr_auto] items-end gap-8 pt-12">
          <div>
            <div className="mb-5 h-px w-72 bg-gradient-to-r from-devil-gold to-transparent" />
            <p className="font-serif-cn text-[28px] text-devil-ivory">
              反方辩友 · {publicAppHost}
            </p>
            <p className="mt-3 font-body-cn text-[20px] text-devil-muted">
              Five voices. One report. No easy exits.
            </p>
            <p className="mt-4 font-mono text-[0.68rem] tracking-[0.18em] text-devil-gold">
              RETURN TO THE JURY
            </p>
            <p className="mt-2 break-all font-mono text-[0.72rem] text-devil-muted">
              {publicAppUrl}
            </p>
          </div>
          <ShareQrCard url={publicAppUrl} />
        </section>
      </div>
    </div>
  );
}
