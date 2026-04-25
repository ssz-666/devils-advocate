import type { Metadata } from "next";
import { HistoryPageClient } from "@/app/history/HistoryPageClient";

export const metadata: Metadata = {
  title: "历史记录",
  description: "回看每一次辩论、判决、模式与分享记录。",
};

export default function HistoryPage() {
  return <HistoryPageClient />;
}
