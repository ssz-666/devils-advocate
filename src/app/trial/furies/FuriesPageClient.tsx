"use client";

import { useState } from "react";
import { FuriesDebateStage } from "@/app/trial/furies/FuriesDebateStage";
import { FuriesStatementStage } from "@/app/trial/furies/FuriesStatementStage";
import { FuriesVerdictStage } from "@/app/trial/furies/FuriesVerdictStage";

export function FuriesPageClient() {
  const [stage, setStage] = useState<"statement" | "debate" | "verdict">("statement");

  if (stage === "statement") {
    return <FuriesStatementStage onStart={() => setStage("debate")} />;
  }

  if (stage === "verdict") {
    return <FuriesVerdictStage onRestart={() => setStage("statement")} />;
  }

  return <FuriesDebateStage onFinish={() => setStage("verdict")} />;
}
