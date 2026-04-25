import type { Metadata } from "next";
import { CourtPageClient } from "@/app/trial/court/CourtPageClient";

export const metadata: Metadata = {
  title: "法庭模式",
  description: "法官、控方、辩方与你同场，完成一次正式的决定审判。",
};

export default function CourtPage() {
  return <CourtPageClient />;
}
