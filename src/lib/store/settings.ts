"use client";

import { create } from "zustand";
import { canUseHostedProvider } from "@/lib/llm/hosted";

export type LlmProvider =
  | "deepseek"
  | "openai"
  | "claude"
  | "kimi"
  | "glm"
  | "tongyi"
  | "custom";

export type ThemeMode = "dark" | "midnight";

export type ProviderConfig = {
  label: string;
  baseUrl: string;
  defaultModel: string;
};

export const PROVIDER_CONFIGS: Record<LlmProvider, ProviderConfig> = {
  deepseek: {
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    defaultModel: "deepseek-chat",
  },
  openai: {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
  },
  claude: {
    label: "Claude",
    baseUrl: "https://api.anthropic.com",
    defaultModel: "claude-3-5-sonnet-latest",
  },
  kimi: {
    label: "Kimi",
    baseUrl: "https://api.moonshot.cn/v1",
    defaultModel: "moonshot-v1-8k",
  },
  glm: {
    label: "智谱 GLM",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    defaultModel: "glm-4-flash",
  },
  tongyi: {
    label: "通义",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    defaultModel: "qwen-turbo",
  },
  custom: {
    label: "自定义 OpenAI 兼容",
    baseUrl: "",
    defaultModel: "",
  },
};

const STORAGE_KEY = "devils-advocate-settings";
const XOR_SECRET = "反方辩友-devils-advocate";

type StoredSettings = {
  provider: LlmProvider;
  encryptedApiKey: string;
  model: string;
  baseUrl: string;
  soundEnabled: boolean;
  gavelSoundEnabled: boolean;
  theme: ThemeMode;
  onboardingSeen: boolean;
};

type SettingsState = {
  provider: LlmProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
  soundEnabled: boolean;
  gavelSoundEnabled: boolean;
  theme: ThemeMode;
  onboardingSeen: boolean;
  isHydrated: boolean;
  isSettingsOpen: boolean;
  hydrate: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  setProvider: (provider: LlmProvider) => void;
  setApiKey: (apiKey: string) => void;
  setModel: (model: string) => void;
  setBaseUrl: (baseUrl: string) => void;
  setSoundEnabled: (soundEnabled: boolean) => void;
  setGavelSoundEnabled: (gavelSoundEnabled: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  setOnboardingSeen: (onboardingSeen: boolean) => void;
  hasApiKey: () => boolean;
  save: () => void;
};

function xorText(input: string) {
  return Array.from(input)
    .map((char, index) =>
      String.fromCharCode(char.charCodeAt(0) ^ XOR_SECRET.charCodeAt(index % XOR_SECRET.length)),
    )
    .join("");
}

function encodeApiKey(apiKey: string) {
  if (!apiKey) {
    return "";
  }

  return btoa(encodeURIComponent(xorText(apiKey)));
}

function decodeApiKey(encryptedApiKey: string) {
  if (!encryptedApiKey) {
    return "";
  }

  try {
    return xorText(decodeURIComponent(atob(encryptedApiKey)));
  } catch {
    return "";
  }
}

function readStoredSettings(): StoredSettings | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredSettings;
  } catch {
    return null;
  }
}

function writeStoredSettings(state: SettingsState) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredSettings = {
    provider: state.provider,
    encryptedApiKey: encodeApiKey(state.apiKey),
    model: state.model,
    baseUrl: state.baseUrl,
    soundEnabled: state.soundEnabled,
    gavelSoundEnabled: state.gavelSoundEnabled,
    theme: state.theme,
    onboardingSeen: state.onboardingSeen,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  provider: "deepseek",
  apiKey: "",
  model: PROVIDER_CONFIGS.deepseek.defaultModel,
  baseUrl: PROVIDER_CONFIGS.deepseek.baseUrl,
  soundEnabled: true,
  gavelSoundEnabled: true,
  theme: "dark",
  onboardingSeen: false,
  isHydrated: false,
  isSettingsOpen: false,
  hydrate: () => {
    if (get().isHydrated) {
      return;
    }

    const stored = readStoredSettings();
    if (!stored) {
      set({ isHydrated: true });
      return;
    }

    const provider = stored.provider ?? "deepseek";
    const fallback = PROVIDER_CONFIGS[provider];
    set({
      provider,
      apiKey: decodeApiKey(stored.encryptedApiKey),
      model: stored.model || fallback.defaultModel,
      baseUrl: stored.baseUrl || fallback.baseUrl,
      soundEnabled: stored.soundEnabled ?? true,
      gavelSoundEnabled: stored.gavelSoundEnabled ?? true,
      theme: stored.theme ?? "dark",
      onboardingSeen: stored.onboardingSeen ?? false,
      isHydrated: true,
    });
  },
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  setProvider: (provider) => {
    const config = PROVIDER_CONFIGS[provider];
    set({
      provider,
      model: config.defaultModel,
      baseUrl: config.baseUrl,
    });
    get().save();
  },
  setApiKey: (apiKey) => {
    set({ apiKey });
    get().save();
  },
  setModel: (model) => {
    set({ model });
    get().save();
  },
  setBaseUrl: (baseUrl) => {
    set({ baseUrl });
    get().save();
  },
  setSoundEnabled: (soundEnabled) => {
    set({ soundEnabled });
    get().save();
  },
  setGavelSoundEnabled: (gavelSoundEnabled) => {
    set({ gavelSoundEnabled });
    get().save();
  },
  setTheme: (theme) => {
    set({ theme });
    get().save();
  },
  setOnboardingSeen: (onboardingSeen) => {
    set({ onboardingSeen });
    get().save();
  },
  hasApiKey: () => {
    const state = get();
    return state.apiKey.trim().length > 0 || canUseHostedProvider(state.provider, state.apiKey);
  },
  save: () => writeStoredSettings(get()),
}));
