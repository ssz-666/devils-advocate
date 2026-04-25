"use client";

import { ShareQrCard } from "@/components/verdict/ShareQrCard";
import type { ShareImageVariant } from "@/lib/image/generateImage";
import { getPublicAppUrl } from "@/lib/share/appUrl";
import { summarizeDecisionQuestion } from "@/lib/verdict/questionSummary";
import { VERDICT_TEMPLATES } from "@/lib/verdict/templates";
import type { DebateSession } from "@/lib/store/debate";

type ShareableImageProps = {
  session: DebateSession;
  variant: ShareImageVariant;
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
  square: "text-[64px]",
  landscape: "text-[68px]",
};

const scoreClasses: Record<ShareImageVariant, string> = {
  portrait: "text-[180px]",
  square: "text-[140px]",
  landscape: "text-[150px]",
};

export function ShareableImage({ session, variant }: ShareableImageProps) {
  const verdict = session.verdict;

  if (!verdict) {
    return null;
  }

  const template = VERDICT_TEMPLATES[verdict.verdict];
  const scoreTone =
    verdict.convictionScore < 40
      ? "#8B0000"
      : verdict.convictionScore < 70
        ? "#B8860B"
        : "#E8E6E3";

  const oneLiner =
    verdict.oneLiner ||
    verdict.sentenceZh ||
    "真正的决定，经得住最锋利的反对。";
  const questionSummary = summarizeDecisionQuestion(session.statement);
  const publicAppUrl = getPublicAppUrl();

  return (
    <div
      className={`${sizeClasses[variant]} ${outerPadding[variant]} relative overflow-hidden bg-devil-bg text-devil-ivory`}
      style={{
        fontFamily: "var(--font-body-cn), 'LXGW WenKai', 'Source Han Serif SC', serif",
      }}
    >
      <div className="noise-texture absolute inset-0 opacity-[0.05] mix-blend-screen" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,0,0,0.25),transparent_34%),radial-gradient(circle_at_14%_18%,rgba(184,134,11,0.06),transparent_22%),radial-gradient(circle_at_88%_78%,rgba(184,134,11,0.05),transparent_24%)]" />
      <div className="absolute inset-[28px] border border-devil-gold/85" />

      <div className="absolute inset-[48px] opacity-45">
        <svg className="h-full w-full" fill="none" viewBox="0 0 1200 1800">
          <path
            d="M600 190v1230M240 520h720M360 410h480M300 1430h600"
            stroke="rgba(184,134,11,0.08)"
          />
          <path
            d="M520 410l-120 140M680 410l120 140M400 550l120 190M800 550l-120 190M450 1000h300"
            stroke="rgba(184,134,11,0.12)"
          />
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
            COURT OF COGNITIVE CLARITY · VERDICT NO. {session.verdictNumber}
          </p>
          <h1 className={`mt-10 font-display leading-none text-devil-ivory ${titleClasses[variant]}`}>
            THE VERDICT
          </h1>
          <p className="mt-4 font-serif-cn text-[30px] text-devil-ivory/76">判决如下</p>
        </section>

        <section className="mt-8 border border-devil-line bg-devil-bg-soft/45 px-7 py-6 text-center">
          <p className="font-mono text-[0.82rem] uppercase tracking-[0.38em] text-devil-gold">
            QUESTION SUMMARY · 问题概括
          </p>
          <p className="mt-5 font-body-cn text-[24px] leading-[1.8] text-devil-ivory">
            {questionSummary}
          </p>
        </section>

        <section className="mt-10 grid grid-cols-[1.1fr_0.9fr] items-center gap-8">
          <div className="text-center">
            <p className="font-display leading-none" style={{ color: scoreTone }}>
              <span className={scoreClasses[variant]}>{verdict.convictionScore}</span>
            </p>
            <p className="mt-4 font-mono text-[0.9rem] uppercase tracking-[0.4em] text-devil-muted">
              CONVICTION SCORE
            </p>
            <p className="mt-6 font-display text-[56px]" style={{ color: scoreTone }}>
              {template.verdictLabel}
            </p>
            <p className="mt-3 font-serif-cn text-[28px] text-devil-ivory/72">
              {template.verdictLabelZh}
            </p>
          </div>

          <div className="space-y-7 border-l border-devil-line/70 pl-8">
            <div>
              <p className="font-display text-[34px] leading-tight text-devil-ivory">
                {template.opening}
              </p>
              <p className="mt-3 font-body-cn text-[22px] leading-[1.8] text-devil-muted">
                {template.openingZh}
              </p>
            </div>
            <div>
              <p className="font-display text-[38px] leading-tight text-devil-ivory">
                “{verdict.sentence || template.closing}”
              </p>
              <p className="mt-3 font-body-cn text-[24px] leading-[1.8] text-devil-muted">
                {verdict.sentenceZh || template.closingZh}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 border border-devil-line bg-devil-bg-soft/45 px-7 py-6 text-center">
          <p className="font-mono text-[0.82rem] uppercase tracking-[0.38em] text-devil-gold">
            FINAL LINE
          </p>
          <p className="mt-5 font-serif-cn text-[34px] leading-[1.8] text-devil-ivory">
            {oneLiner}
          </p>
        </section>

        <section className="mt-12 grid grid-cols-2 gap-8">
          <div>
            <p className="font-mono text-[0.78rem] uppercase tracking-[0.32em] text-devil-red">
              Fatal Flaws · 致命漏洞
            </p>
            <div className="mt-5 space-y-4">
              {verdict.fatalFlaws.slice(0, 3).map((item, index) => (
                <div className="border-l border-devil-red pl-4" key={`${item.flaw}-${index}`}>
                  <p className="font-body-cn text-[22px] leading-[1.8] text-devil-ivory">
                    {item.flaw}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[0.78rem] uppercase tracking-[0.32em] text-devil-gold">
              Solid Pillars · 坚固堡垒
            </p>
            <div className="mt-5 space-y-4">
              {verdict.solidPillars.slice(0, 3).map((item, index) => (
                <div className="border-l border-devil-gold pl-4" key={`${item.pillar}-${index}`}>
                  <p className="font-body-cn text-[22px] leading-[1.8] text-devil-ivory">
                    {item.pillar}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-auto grid grid-cols-[1fr_auto] items-end gap-8 pt-12">
          <div>
            <div className="mb-5 h-px w-72 bg-gradient-to-r from-devil-gold to-transparent" />
            <p className="font-serif-cn text-[28px] text-devil-ivory">
              反方辩友 · devils-advocate.app
            </p>
            <p className="mt-3 font-body-cn text-[20px] text-devil-muted">
              Your worst critic, for your best decisions
            </p>
            <p className="mt-4 font-mono text-[0.68rem] tracking-[0.18em] text-devil-gold">
              VISIT THE COURT
            </p>
            <p className="mt-2 break-all font-mono text-[0.72rem] text-devil-muted">
              {publicAppUrl}
            </p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="font-mono text-[18px] uppercase tracking-[0.2em] text-devil-muted">
                FINAL REMARK
              </p>
              <p className="mt-3 max-w-xs font-body-cn text-[22px] leading-[1.7] text-devil-ivory">
                {verdict.advocateRemark || template.closingZh}
              </p>
            </div>
            <ShareQrCard url={publicAppUrl} />
          </div>
        </section>
      </div>
    </div>
  );
}
