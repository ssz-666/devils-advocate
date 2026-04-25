import type { Metadata } from "next";
import { SettingsPageClient } from "@/app/settings/SettingsPageClient";

export const metadata: Metadata = {
  title: "设置",
  description: "配置模型、音效、主题与本地数据管理。",
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}
