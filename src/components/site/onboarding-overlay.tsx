"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSettingsStore } from "@/lib/store/settings";

const steps = [
  {
    eyebrow: "STEP 1",
    title: "这不是聊天工具。",
    body: "这是一个故意站在你对立面的认知审判器。它的职责不是安慰你，而是逼你把决定想清楚。",
  },
  {
    eyebrow: "STEP 2",
    title: "先接入你的模型。",
    body: "第一次使用前，需要配置 API Key。判决阶段会自动切到快模型，保证体验不被拖垮。",
  },
  {
    eyebrow: "STEP 3",
    title: "选一个模式，进场。",
    body: "单刀适合快速自证；围攻适合多角度拆解；法庭适合最正式的一次公开审判。",
  },
];

export function OnboardingOverlay() {
  const hydrate = useSettingsStore((state) => state.hydrate);
  const onboardingSeen = useSettingsStore((state) => state.onboardingSeen);
  const setOnboardingSeen = useSettingsStore((state) => state.setOnboardingSeen);
  const openSettings = useSettingsStore((state) => state.openSettings);
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  if (!ready || onboardingSeen) {
    return null;
  }

  const isLast = step === steps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[90] bg-devil-bg/88 backdrop-blur-md"
        initial={{ opacity: 0 }}
      >
        <div className="flex min-h-screen items-center justify-center px-5">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl border border-devil-gold/45 bg-devil-bg-soft/90 px-8 py-12 text-center shadow-[0_0_80px_rgba(139,0,0,0.22)] sm:px-14"
            initial={{ opacity: 0, y: 24 }}
          >
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-devil-gold">
              {steps[step].eyebrow}
            </p>
            <h2 className="mt-6 font-serif-cn text-5xl leading-tight tracking-[-0.05em] text-devil-ivory sm:text-7xl">
              {steps[step].title}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl font-body-cn text-base leading-8 text-devil-muted">
              {steps[step].body}
            </p>

            <div className="mt-10 flex justify-center gap-2">
              {steps.map((item, index) => (
                <span
                  className={`h-px w-12 ${index === step ? "bg-devil-red" : "bg-devil-line"}`}
                  key={item.eyebrow}
                />
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {step === 1 ? (
                <button
                  className="quill-cursor border border-devil-gold px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-gold transition-colors hover:bg-devil-gold hover:text-devil-bg"
                  onClick={openSettings}
                  type="button"
                >
                  打开设置
                </button>
              ) : null}

              {!isLast ? (
                <button
                  className="quill-cursor bg-devil-red px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-ivory transition-colors hover:bg-[#a50000]"
                  onClick={() => setStep((current) => current + 1)}
                  type="button"
                >
                  下一步
                </button>
              ) : (
                <Link
                  className="quill-cursor bg-devil-red px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-ivory transition-colors hover:bg-[#a50000]"
                  href="/trial/single"
                  onClick={() => setOnboardingSeen(true)}
                >
                  进入产品
                </Link>
              )}

              <button
                className="quill-cursor border border-devil-line px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-devil-muted transition-colors hover:border-devil-gold hover:text-devil-ivory"
                onClick={() => setOnboardingSeen(true)}
                type="button"
              >
                跳过引导
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
