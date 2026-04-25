import type { LlmProvider } from "@/lib/store/settings";
import { canUseHostedProvider } from "@/lib/llm/hosted";

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatCompletionInput = {
  provider: LlmProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  signal?: AbortSignal;
  onToken?: (token: string) => void;
  onRetry?: (attempt: number) => void;
  timeoutMs?: number;
  maxTokens?: number;
  retryCount?: number;
  purpose?: "general" | "verdict";
  requestTag?: string;
};

export type ChatCompletionResult = {
  content: string;
};

const FAST_MODELS: Partial<Record<LlmProvider, string>> = {
  deepseek: "deepseek-chat",
  openai: "gpt-4o-mini",
  kimi: "moonshot-v1-8k",
  tongyi: "qwen-turbo",
  glm: "glm-4-flash",
  claude: "claude-3-5-haiku-latest",
};

const REASONING_MODEL_PATTERNS = [/reasoner/i, /\bo1\b/i, /\bo3\b/i, /\br1\b/i];

class HttpStatusError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpStatusError";
  }
}

function trimSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function createTimeoutError(timeoutMs: number) {
  return new Error(`请求超时（${Math.round(timeoutMs / 1000)} 秒）。`);
}

function resolveModel(input: ChatCompletionInput) {
  if (input.purpose !== "verdict") {
    return input.model;
  }

  const configuredModel = input.model.trim();
  const detectedReasoningModel = REASONING_MODEL_PATTERNS.some((pattern) =>
    pattern.test(configuredModel),
  );

  if (detectedReasoningModel) {
    return FAST_MODELS[input.provider] ?? configuredModel;
  }

  return FAST_MODELS[input.provider] ?? configuredModel;
}

function withTimeout(signal: AbortSignal | undefined, timeoutMs: number | undefined) {
  if (!timeoutMs) {
    return {
      signal,
      cleanup: () => {},
    };
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort(createTimeoutError(timeoutMs));
  }, timeoutMs);

  const abortFromParent = () => {
    controller.abort(signal?.reason);
  };

  signal?.addEventListener("abort", abortFromParent, { once: true });

  return {
    signal: controller.signal,
    cleanup: () => {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", abortFromParent);
    },
  };
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function emitWithTypewriter(token: string, onToken?: (token: string) => void) {
  if (!onToken || !token) {
    return;
  }

  for (const char of Array.from(token)) {
    onToken(char);
    await delay(20 + Math.floor(Math.random() * 21));
  }
}

function createQueuedEmitter(onToken?: (token: string) => void) {
  let queue = Promise.resolve();

  return {
    push(token: string) {
      if (!token || !onToken) {
        return;
      }

      queue = queue.then(() => emitWithTypewriter(token, onToken));
    },
    async flush() {
      await queue;
    },
  };
}

function parseOpenAiCompatibleLine(line: string) {
  if (!line.startsWith("data:")) {
    return "";
  }

  const payload = line.replace(/^data:\s*/, "").trim();
  if (!payload || payload === "[DONE]") {
    return "";
  }

  try {
    const parsed = JSON.parse(payload) as {
      choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }>;
    };
    return parsed.choices?.[0]?.delta?.content ?? parsed.choices?.[0]?.message?.content ?? "";
  } catch {
    return "";
  }
}

function parseClaudeLine(line: string) {
  if (!line.startsWith("data:")) {
    return "";
  }

  const payload = line.replace(/^data:\s*/, "").trim();
  if (!payload || payload === "[DONE]") {
    return "";
  }

  try {
    const parsed = JSON.parse(payload) as {
      type?: string;
      delta?: { text?: string };
    };
    return parsed.type === "content_block_delta" ? parsed.delta?.text ?? "" : "";
  } catch {
    return "";
  }
}

async function readSseStream(
  response: Response,
  parser: (line: string) => string,
  requestTag: string | undefined,
  onToken?: (token: string) => void,
) {
  if (!response.body) {
    throw new Error("服务商没有返回可读取的流。");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const queuedEmitter = createQueuedEmitter(onToken);
  let buffer = "";
  let content = "";
  let lastChunkAt = performance.now();

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const token = parser(line.trim());
      if (!token) {
        continue;
      }

      const now = performance.now();
      const chunkGap = Math.round(now - lastChunkAt);
      lastChunkAt = now;
      if (requestTag) {
        console.log(`[Verdict ${requestTag}] chunk arrived at`, Date.now(), "gap", chunkGap, "ms");
        if (chunkGap > 2000) {
          console.warn(`[Verdict ${requestTag}] chunk gap exceeded 2s`, chunkGap, "ms");
        }
      }

      content += token;
      queuedEmitter.push(token);
    }
  }

  await queuedEmitter.flush();
  return { content };
}

async function createOpenAiCompatibleCompletion(input: ChatCompletionInput) {
  const { signal, cleanup } = withTimeout(input.signal, input.timeoutMs);
  const actualModel = resolveModel(input);

  console.log(`[Verdict ${input.requestTag ?? "?"}] sent at`, Date.now());
  console.log(
    `[Verdict ${input.requestTag ?? "?"}] model`,
    actualModel,
    "stream",
    input.stream ?? false,
  );

  const response = await fetch(`${trimSlash(input.baseUrl)}/chat/completions`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      model: actualModel,
      messages: input.messages,
      stream: input.stream ?? false,
      temperature: input.temperature ?? 0.7,
      max_tokens: input.maxTokens,
    }),
  });

  try {
    if (!response.ok) {
      const detail = await response.text();
      throw new HttpStatusError(response.status, detail || `请求失败：${response.status}`);
    }

    if (input.stream) {
      const streamed = await readSseStream(
        response,
        parseOpenAiCompatibleLine,
        input.requestTag,
        input.onToken,
      );
      return { content: streamed.content };
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return { content: data.choices?.[0]?.message?.content ?? "" };
  } finally {
    cleanup();
  }
}

async function createHostedDeepSeekCompletion(input: ChatCompletionInput) {
  const { signal, cleanup } = withTimeout(input.signal, input.timeoutMs);
  const actualModel = resolveModel(input);

  console.log(`[Verdict ${input.requestTag ?? "?"}] sent at`, Date.now());
  console.log(
    `[Verdict ${input.requestTag ?? "?"}] model`,
    actualModel,
    "stream",
    input.stream ?? false,
    "(hosted proxy)",
  );

  const response = await fetch("/api/llm/chat", {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      provider: input.provider,
      model: actualModel,
      messages: input.messages,
      stream: input.stream ?? false,
      temperature: input.temperature ?? 0.7,
      maxTokens: input.maxTokens,
    }),
  });

  try {
    if (!response.ok) {
      const detail = await response.text();
      throw new HttpStatusError(response.status, detail || `请求失败：${response.status}`);
    }

    if (input.stream) {
      const streamed = await readSseStream(
        response,
        parseOpenAiCompatibleLine,
        input.requestTag,
        input.onToken,
      );
      return { content: streamed.content };
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return { content: data.choices?.[0]?.message?.content ?? "" };
  } finally {
    cleanup();
  }
}

async function createClaudeCompletion(input: ChatCompletionInput) {
  const { signal, cleanup } = withTimeout(input.signal, input.timeoutMs);
  const actualModel = resolveModel(input);
  const system = input.messages.find((message) => message.role === "system")?.content ?? "";
  const messages = input.messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content,
    }));

  console.log(`[Verdict ${input.requestTag ?? "?"}] sent at`, Date.now());
  console.log(
    `[Verdict ${input.requestTag ?? "?"}] model`,
    actualModel,
    "stream",
    input.stream ?? false,
  );

  const response = await fetch(`${trimSlash(input.baseUrl)}/v1/messages`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": input.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: actualModel,
      system,
      messages,
      max_tokens: input.maxTokens ?? 900,
      stream: input.stream ?? false,
      temperature: input.temperature ?? 0.7,
    }),
  });

  try {
    if (!response.ok) {
      const detail = await response.text();
      throw new HttpStatusError(response.status, detail || `请求失败：${response.status}`);
    }

    if (input.stream) {
      const streamed = await readSseStream(
        response,
        parseClaudeLine,
        input.requestTag,
        input.onToken,
      );
      return { content: streamed.content };
    }

    const data = (await response.json()) as {
      content?: Array<{ text?: string }>;
    };
    return { content: data.content?.map((block) => block.text ?? "").join("") ?? "" };
  } finally {
    cleanup();
  }
}

function isTimeoutError(error: unknown) {
  return error instanceof Error && /超时|timed out|timeout/i.test(error.message);
}

function isRetryableError(error: unknown) {
  return isTimeoutError(error) || (error instanceof HttpStatusError && error.status >= 500);
}

function logRequestTiming(input: ChatCompletionInput, startedAt: number, status: "ok" | "error") {
  const elapsed = Math.round(performance.now() - startedAt);
  const prefix = `[Verdict ${input.requestTag ?? "?"}]`;

  console.log(`${prefix} received at`, Date.now(), "took", elapsed, "ms", status);
  if (elapsed > 20000) {
    console.warn(`${prefix} exceeded 20s`, elapsed, "ms");
  }
}

async function executeCompletion(input: ChatCompletionInput) {
  if (canUseHostedProvider(input.provider, input.apiKey)) {
    return createHostedDeepSeekCompletion(input);
  }

  if (input.provider === "claude") {
    return createClaudeCompletion(input);
  }

  return createOpenAiCompatibleCompletion(input);
}

export async function createChatCompletion(
  input: ChatCompletionInput,
): Promise<ChatCompletionResult> {
  if (!input.apiKey.trim() && !canUseHostedProvider(input.provider, input.apiKey)) {
    throw new Error("请先配置 API Key。");
  }

  if (!input.baseUrl.trim()) {
    throw new Error("请先配置服务商 Base URL。");
  }

  if (!input.model.trim()) {
    throw new Error("请先配置模型名称。");
  }

  const startedAt = performance.now();
  const retryCount = input.retryCount ?? 1;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      const result = await executeCompletion(input);
      logRequestTiming(input, startedAt, "ok");
      return { content: result.content };
    } catch (error) {
      lastError = error;
      const shouldRetry = attempt < retryCount && isRetryableError(error);
      if (shouldRetry) {
        input.onRetry?.(attempt + 1);
        continue;
      }

      logRequestTiming(input, startedAt, "error");
      throw error;
    }
  }

  logRequestTiming(input, startedAt, "error");
  throw lastError instanceof Error ? lastError : new Error("请求失败。");
}
