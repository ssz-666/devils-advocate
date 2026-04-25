import type { Metadata } from "next";
import { HomePage } from "@/components/home/home-page";

export const metadata: Metadata = {
  title: "首页",
  description: "一个让你在做决定前先被彻底反驳的 AI 辩论产品。",
};

export default function Page() {
  return <HomePage />;
}
