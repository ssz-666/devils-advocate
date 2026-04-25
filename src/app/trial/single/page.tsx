"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DebateStage } from "@/app/trial/single/components/DebateStage";
import { StatementStage } from "@/app/trial/single/components/StatementStage";
import { useDebateStore } from "@/lib/store/debate";
import { useSettingsStore } from "@/lib/store/settings";

export default function SingleTrialPage() {
  const router = useRouter();
  const currentStage = useDebateStore((state) => state.currentStage);
  const id = useDebateStore((state) => state.id);
  const statement = useDebateStore((state) => state.statement);
  const hydrateSettings = useSettingsStore((state) => state.hydrate);

  useEffect(() => {
    hydrateSettings();
  }, [hydrateSettings]);

  useEffect(() => {
    if (currentStage === "verdict" && statement) {
      router.push(`/trial/single/verdict?session=${id}`);
    }
  }, [currentStage, id, router, statement]);

  if (currentStage === "debate") {
    return <DebateStage />;
  }

  return <StatementStage />;
}
