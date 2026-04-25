import { NextRequest, NextResponse } from "next/server";
import { HOSTED_DEEPSEEK_MODEL } from "@/lib/llm/hosted";

type ProxyBody = {
  provider?: string;
  model?: string;
  messages?: Array<{ role: string; content: string }>;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const REQUEST_BUCKET = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function checkOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    return true;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function checkRateLimit(clientKey: string) {
  const now = Date.now();
  const current = REQUEST_BUCKET.get(clientKey);

  if (!current || current.resetAt <= now) {
    REQUEST_BUCKET.set(clientKey, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  current.count += 1;
  REQUEST_BUCKET.set(clientKey, current);
  return true;
}

function sanitizeBody(body: ProxyBody) {
  const messages = Array.isArray(body.messages) ? body.messages.slice(0, 40) : [];
  const totalChars = messages.reduce((sum, message) => sum + String(message.content ?? "").length, 0);

  if (messages.length === 0 || totalChars > 30_000) {
    throw new Error("Invalid messages payload.");
  }

  return {
    model: HOSTED_DEEPSEEK_MODEL,
    messages: messages.map((message) => ({
      role: message.role,
      content: String(message.content ?? "").slice(0, 8_000),
    })),
    stream: Boolean(body.stream),
    temperature: typeof body.temperature === "number" ? body.temperature : 0.7,
    max_tokens:
      typeof body.maxTokens === "number"
        ? Math.min(Math.max(body.maxTokens, 1), 1200)
        : undefined,
  };
}

export async function POST(request: NextRequest) {
  if (!checkOrigin(request)) {
    return NextResponse.json({ error: "Forbidden origin." }, { status: 403 });
  }

  const clientKey = getClientKey(request);
  if (!checkRateLimit(clientKey)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Hosted DeepSeek is not configured." }, { status: 500 });
  }

  let body: ProxyBody;
  try {
    body = (await request.json()) as ProxyBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const payload = sanitizeBody(body);
    const upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      return new NextResponse(detail || "Upstream request failed.", {
        status: upstream.status,
        headers: {
          "Content-Type": upstream.headers.get("content-type") || "text/plain; charset=utf-8",
        },
      });
    }

    if (payload.stream) {
      return new NextResponse(upstream.body, {
        status: 200,
        headers: {
          "Content-Type": upstream.headers.get("content-type") || "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    const text = await upstream.text();
    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal proxy error.",
      },
      { status: 500 },
    );
  }
}
