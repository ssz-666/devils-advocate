"use client";

import { motion } from "framer-motion";
import { CourtroomButton } from "@/components/home/courtroom-button";
import { InkWash } from "@/components/home/ink-wash";
import { KineticScale } from "@/components/home/kinetic-scale";
import { ParallaxSection } from "@/components/home/parallax-section";
import { StaggeredTitle } from "@/components/home/staggered-title";
import { CourtScaleIcon, DaggerIcon, FiveBladesIcon } from "@/components/home/trial-icons";
import { TrialCard } from "@/components/home/trial-card";

const trialModes = [
  {
    cnTitle: "单刀",
    subtitle: "Single Blade",
    description: "一对一理性反驳。没有掌声，没有安慰，只有你决定里最薄弱的那一刀。",
    href: "/trial/single",
    icon: <DaggerIcon />,
  },
  {
    cnTitle: "围攻",
    subtitle: "Five Furies",
    description: "五个角色轮番进攻，从责任、未来、情感、幻想与恶意同时拆你。",
    href: "/trial/furies",
    icon: <FiveBladesIcon />,
  },
  {
    cnTitle: "法庭",
    subtitle: "The Courtroom",
    description: "法官、控方、辩方与你同场。最正式，也最戏剧化的一次审判。",
    href: "/trial/court",
    icon: <CourtScaleIcon />,
  },
];

const quotes = [
  {
    text: "未经审视的人生，不值得过。",
    source: "苏格拉底",
  },
  {
    text: "怀疑并不令人愉快，但确信是荒谬的。",
    source: "伏尔泰",
  },
  {
    text: "受过训练的头脑，能够容纳一种想法，而不急于接受它。",
    source: "亚里士多德",
  },
];

export function HomePage() {
  return (
    <>
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 pt-16 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(139,0,0,0.28),transparent_34%),radial-gradient(circle_at_78%_76%,rgba(184,134,11,0.08),transparent_28%)]" />
        <InkWash />
        <KineticScale />
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mx-auto max-w-6xl text-center"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-8 font-mono text-[0.65rem] uppercase tracking-[0.38em] text-devil-muted/70">
            EST. 2026 · COGNITIVE CLARITY INSTRUMENT
          </p>
          <StaggeredTitle
            lines={[
              { text: "每个决定，都该有一个" },
              { text: "最锋利的反方。", className: "text-devil-red" },
            ]}
          />
          <p className="mx-auto mt-8 max-w-3xl font-serif-cn text-[1.35rem] leading-relaxed text-devil-ivory/85 sm:text-2xl">
            让最锋利的反对声，替你做决定前的最后一道审视
          </p>
          <p className="mx-auto mt-7 max-w-[500px] whitespace-pre-line font-body-cn text-base leading-8 text-devil-muted">
            {`你说的每句话，我都会反驳。
不是因为你错了，是因为你值得被真正理解。
你必须说服我——否则，你就还没真的想清楚。`}
          </p>
          <div className="mt-10">
            <CourtroomButton />
          </div>
        </motion.div>
      </section>

      <ParallaxSection className="border-y border-devil-line/70 bg-devil-bg-soft/25">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-devil-gold">
                辩论模式
              </p>
              <h2 className="mt-3 font-serif-cn text-5xl tracking-[-0.06em] text-devil-ivory sm:text-7xl">
                选择你的审判
              </h2>
            </div>
            <p className="max-w-sm font-body-cn text-sm leading-7 text-devil-muted">
              选择你愿意承受的反对强度。越锋利，越接近清醒。
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {trialModes.map((mode) => (
              <TrialCard key={mode.cnTitle} {...mode} />
            ))}
          </div>
        </div>
      </ParallaxSection>

      <ParallaxSection>
        <div className="mx-auto grid max-w-7xl gap-10">
          {quotes.map((quote, index) => (
            <motion.figure
              className="border-l border-devil-red/70 pl-6 sm:pl-10"
              initial={{ opacity: 0, x: -20 }}
              key={quote.source}
              transition={{ delay: index * 0.12, duration: 0.7 }}
              viewport={{ once: true, margin: "-120px" }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <blockquote className="max-w-5xl font-serif-cn text-4xl leading-tight tracking-[-0.06em] text-devil-ivory sm:text-7xl">
                “{quote.text}”
              </blockquote>
              <figcaption className="mt-5 font-mono text-[0.68rem] uppercase tracking-[0.28em] text-devil-gold">
                {quote.source}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </ParallaxSection>

      <section
        className="relative overflow-hidden border-t border-devil-line px-5 py-28 text-center sm:px-8"
        id="trial"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,0,0,0.26),transparent_42%)]" />
        <div className="relative mx-auto max-w-4xl">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.32em] text-devil-muted">
            FINAL SUMMONS
          </p>
          <h2 className="mt-5 font-serif-cn text-5xl leading-tight tracking-[-0.06em] text-devil-ivory sm:text-8xl">
            你的第一场审判，正在等你
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-body-cn text-base leading-8 text-devil-muted">
            把那个正在折磨你的决定交出来。十分钟后，你会得到一个更冷静、更完整、也更难逃避的判决。
          </p>
          <div className="mt-10">
            <CourtroomButton>开始反驳</CourtroomButton>
          </div>
        </div>
      </section>
    </>
  );
}
