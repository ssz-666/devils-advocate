"use client";

import { useState } from "react";
import { CourtDebateStage } from "@/app/trial/court/CourtDebateStage";
import { CourtStatementStage } from "@/app/trial/court/CourtStatementStage";
import { CourtVerdictStage } from "@/app/trial/court/CourtVerdictStage";

export function CourtPageClient() {
  const [stage, setStage] = useState<"statement" | "debate" | "verdict">("statement");

  if (stage === "statement") {
    return <CourtStatementStage onStart={() => setStage("debate")} />;
  }

  if (stage === "verdict") {
    return <CourtVerdictStage onRestart={() => setStage("statement")} />;
  }

  return <CourtDebateStage onFinish={() => setStage("verdict")} />;
}
