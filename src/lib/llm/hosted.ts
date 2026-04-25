import type { LlmProvider } from "@/lib/store/settings";

export const HOSTED_PROVIDER: LlmProvider = "deepseek";
export const HOSTED_DEEPSEEK_MODEL = "deepseek-chat";

export function isHostedDeepSeekEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_HOSTED_DEEPSEEK === "true";
}

export function canUseHostedProvider(provider: LlmProvider, apiKey?: string) {
  return provider === HOSTED_PROVIDER && !apiKey?.trim() && isHostedDeepSeekEnabled();
}
