import type { Metadata } from "next";
import { FuriesPageClient } from "@/app/trial/furies/FuriesPageClient";

export const metadata: Metadata = {
  title: "围攻模式",
  description: "五个不同人格轮番上场，从五个方向同时拆解你的决定。",
};

export default function FuriesPage() {
  return <FuriesPageClient />;
}
