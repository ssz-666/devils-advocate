"use client";

import { ShareQrCard } from "@/components/verdict/ShareQrCard";
import type { ShareImageVariant } from "@/lib/image/generateImage";
import { getPublicAppUrl } from "@/lib/share/appUrl";
import type { CourtSentence } from "@/lib/verdict/courtVerdictTemplates";
import { summarizeDecisionQuestion } from "@/lib/verdict/questionSummary";

type Breakdown = {
  prosecutionStrength: number;
  defenseStrength: number;
  evidenceClarity: number;
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

const titleClasses: Record<ShareImageVariant, string> = {
  portrait: "text-[78px]",
  square: "text-[62px]",
  landscape: "text-[66px]",
};

const bodyClasses: Record<ShareImageVariant, string> = {
  portrait: "text-[26px]",
  square: "text-[22px]",
  landscape: "text-[24px]",
};

export function ShareableCourtImage({
  variant,
  verdictNumber,
  statement,
  sentence,
  breakdown,
  commentaryZh,
  fatalFlaws = [],
  solidPillars = [],
}: {
  variant: ShareImageVariant;
  verdictNumber: string;
  statement: string;
  sentence: CourtSentence;
  breakdown: Breakdown;
  commentaryZh?: string;
  fatalFlaws?: string[];
  solidPillars?: string[];
}) {
  const questionSummary = summarizeDecisionQuestion(statement);
  const publicAppUrl = getPublicAppUrl();
  const rows = [
    { label: "PROSECUTION", zh: "控方强度", value: breakdown.prosecutionStrength, color: "#8B0000" },
    { label: "DEFENSE", zh: "辩方强度", value: breakdown.defenseStrength, color: "#B8860B" },
    { label: "EVIDENCE", zh: "证据清晰度", value: breakdown.evidenceClarity, color: "#E8E6E3" },
  ];

  const rulingRows = [
    { en: sentence.gavelLine, zh: sentence.gavelLineZh },
    { en: sentence.recital, zh: sentence.recitalZh },
    { en: sentence.ruling, zh: sentence.rulingZh },
    { en: sentence.admonition, zh: sentence.admonitionZh },
  ];

  return (
    <div
      className={`${sizeClasses[variant]} ${outerPadding[variant]} relative overflow-hidden bg-devil-bg text-devil-ivory`}
      style={{
        fontFamily: "var(--font-body-cn), 'LXGW WenKai', 'Source Han Serif SC', serif",
      }}
    >
      <div className="noise-texture absolute inset-0 opacity-[0.05] mix-blend-screen" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,0,0,0.22),transparent_35%),radial-gradient(circle_at_12%_12%,rgba(184,134,11,0.08),transparent_25%),radial-gradient(circle_at_88%_18%,rgba(184,134,11,0.06),transparent_22%)]" />
      <div className="absolute inset-[28px] border border-devil-gold/85" />

      <div className="absolute inset-[48px] opacity-50">
        <svg className="h-full w-full" fill="none" viewBox="0 0 1200 1800">
          <path
            d="M180 1390h840M340 1390V720M860 1390V720M430 620h340M600 220v320M520 560l-140 120-100 240h200l-100-240M680 560l140 120 100 240H720l100-240"
            stroke="rgba(184,134,11,0.18)"
          />
          <path d="M260 1470h680M330 1520h540" stroke="rgba(184,134,11,0.12)" />
          <path d="M600 620V1320" stroke="rgba(184,134,11,0.1)" />
          <path d="M240 1180h720" stroke="rgba(184,134,11,0.08)" />
        </svg>
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <section className="flex flex-col items-center pt-6 text-center">
          <svg className="size-16 text-devil-gold" fill="none" viewBox="0 0 64 64">
            <path
              d="M32 8v44M16 20h32M32 14 17 20 8 40h18l-9-20M32 14 47 20l-9 20h18l-9-20M22 52h20M26 58h12"
              stroke="currentColor"
            />
          </svg>
          <p className="mt-6 font-mono text-[0.72rem] uppercase tracking-[0.42em] text-devil-gold">
            JUDICIAL RULING · CASE NO. {verdictNumber}
          </p>
          <h1 className={`mt-10 font-display leading-none text-devil-ivory ${titleClasses[variant]}`}>
            JUDICIAL RULING
          </h1>
          <p className="mt-4 font-serif-cn text-[30px] text-devil-ivory/76">法庭最终宣判</p>
        </section>

        <section className="mt-8 border border-devil-line bg-devil-bg-soft/45 px-7 py-6 text-center">
          <p className="font-mono text-[0.82rem] uppercase tracking-[0.38em] text-devil-gold">
            QUESTION SUMMARY · 问题概括
          </p>
          <p className={`mt-5 font-body-cn leading-[1.8] text-devil-ivory ${bodyClasses[variant]}`}>
            {questionSummary}
          </p>
        </section>

        <section className="mt-12">
          <div className="space-y-5">
            {rows.map((row) => (
              <div key={row.label}>
                <div className="mb-2 flex items-center justify-between">
                  <p
                    className="font-mono text-[0.92rem] uppercase tracking-[0.38em]"
                    style={{ color: row.color }}
                  >
                    {row.label}
                  </p>
                  <p className="font-serif-cn text-[18px] text-devil-muted">{row.zh}</p>
                </div>
                <div className="h-4 overflow-hidden bg-devil-line/35">
                  <div className="h-full" style={{ width: `${row.value}%`, backgroundColor: row.color }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 space-y-10">
          {rulingRows.map((row, index) => (
            <div key={`${row.en}-${index}`}>
              <p
                className={`font-display leading-tight text-devil-ivory ${
                  index === 2 ? "text-[56px]" : "text-[38px]"
                }`}
              >
                {row.en}
              </p>
              <p className={`mt-4 font-body-cn leading-[1.8] text-devil-muted ${bodyClasses[variant]}`}>
                {row.zh}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-12 border border-devil-line bg-devil-bg-soft/45 px-7 py-6">
          <p className="font-mono text-[0.82rem] uppercase tracking-[0.38em] text-devil-gold">
            JUDICIAL COMMENTARY
          </p>
          <p className={`mt-5 font-body-cn leading-[1.8] text-devil-ivory ${bodyClasses[variant]}`}>
            {commentaryZh || "本庭不补赘言，卷宗本身已足够沉重。"}
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
              反方辩友 · devils-advocate.app
            </p>
            <p className="mt-3 font-body-cn text-[20px] text-devil-muted">
              The ruling is archived. The road remains yours.
            </p>
            <p className="mt-4 font-mono text-[0.68rem] tracking-[0.18em] text-devil-gold">
              ENTER THE COURT
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
