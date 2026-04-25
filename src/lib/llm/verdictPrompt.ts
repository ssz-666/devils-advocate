import type { Quote } from "@/lib/verdict/quotesLibrary";
import type { VerdictStatus } from "@/lib/store/debate";

export type QuickJudgment = {
  score: number;
  verdictType: VerdictStatus;
};

export type QuoteSelection = {
  choice: "A" | "B" | "C";
  en: string;
  zh: string;
};

export type DeepAnalysis = {
  fatalFlaws: string[];
  solidPillars: string[];
};

function clipText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength)}…`;
}

export function summarizeStatement(statement: string, maxLength = 50) {
  return clipText(statement, maxLength);
}

export function buildQuickJudgmentPrompt(compressedConversation: string) {
  return {
    system:
      "你是一位严肃理性的法官。只返回“数字|词”。词只能是 CONVICTED、UNRESOLVED、ACQUITTED。",
    user: [
      "你是一位严肃理性的法官，刚听完一场辩论。根据以下辩论摘要，给出两个结果：",
      "",
      "一个 0-100 的数字，表示辩论方决定的成立度（0=完全不成立，100=完全成立）",
      "一个词：CONVICTED（决定不成立）/ UNRESOLVED（未决）/ ACQUITTED（决定成立）",
      "",
      "只返回：数字|词",
      "示例：72|UNRESOLVED",
      "禁止添加任何解释、markdown、标点之外的字符。",
      "辩论摘要：",
      compressedConversation,
    ].join("\n"),
  };
}

export function buildQuoteSelectionPrompt(
  statementSummary: string,
  score: number,
  candidates: [Quote, Quote, Quote],
) {
  return {
    system:
      "你只做判词选择和微调。输出一行：CHOICE|EN微调后|ZH微调后。不要解释，不要换行。",
    user: [
      `用户的决定摘要：${statementSummary}`,
      `决定成立度得分：${score}/100`,
      "以下是三句候选判词，请选出最贴合用户情境的一句，并可选地微调其中的 1 到 2 个词使其更贴近用户具体陈述，但不要改变句式结构。",
      `A. ${candidates[0].en} / ${candidates[0].zh}`,
      `B. ${candidates[1].en} / ${candidates[1].zh}`,
      `C. ${candidates[2].en} / ${candidates[2].zh}`,
      "返回格式：",
      "CHOICE|EN微调后|ZH微调后",
      "示例：",
      "B|The map is ready. The road will surprise you.|地图已备好，路途自有意外。",
      "只返回一行，不要解释。",
    ].join("\n"),
  };
}

export function buildDeepAnalysisPrompt(compressedConversation: string) {
  return {
    system:
      "你是一位冷静的反方辩手。只返回 JSON：fatalFlaws 和 solidPillars，各 3 条，每条不超过 25 字。",
    user: [
      "你是一位冷静的反方辩手。根据以下辩论摘要，从辩论方（用户）的立场审视，输出：",
      "",
      "3 条最致命的逻辑漏洞或事实缺失（fatalFlaws），每条不超过 25 字",
      "3 条最坚固的依据或合理之处（solidPillars），每条不超过 25 字",
      "",
      "严格按以下 JSON 格式返回，不要任何额外文字：",
      '{"fatalFlaws":["...","...","..."],"solidPillars":["...","...","..."]}',
      "辩论摘要：",
      compressedConversation,
    ].join("\n"),
  };
}

export function buildFuriesConvergencePrompt(roleOpinionsSummary: string) {
  return {
    system: "你正在总结一场多人辩论的合议结果。只按指定格式输出两行，不要解释。",
    user: [
      "你正在总结一场多人辩论的合议结果。五个评议者对用户决定的态度已知：",
      roleOpinionsSummary,
      "请基于他们的观点差异，用两段话分别描述：",
      "",
      "共识（CONVERGENCE）：大家都认同的一点，不超过30字",
      "分歧（DIVERGENCE）：最明显的意见冲突，不超过30字",
      "",
      "严格格式返回（两行，不要解释）：",
      "CONVERGENCE|中文共识",
      "DIVERGENCE|中文分歧",
    ].join("\n"),
  };
}

export function buildCourtCommentaryPrompt(
  statementSummary: string,
  verdictType: VerdictStatus,
  score: number,
) {
  return {
    system: "你是主审法官。只返回两行：EN|... 和 ZH|...。不要解释。",
    user: [
      `案情摘要：${statementSummary}`,
      `最终判决：${verdictType}（成立度 ${score}/100）`,
      "请用法官的口吻，补充一句针对此案的个人评述（Judicial Commentary），要求：",
      "中英文各一句",
      "不要重复已宣读的裁决内容",
      "戏剧感但克制，带一点余韵",
      "英文 15 words 以内，中文 30 字以内",
      "",
      "严格返回格式：",
      "EN|...",
      "ZH|...",
    ].join("\n"),
  };
}

export function parseQuickJudgment(raw: string): QuickJudgment {
  const matched = raw.match(/(\d{1,3})\s*\|\s*(CONVICTED|UNRESOLVED|ACQUITTED)/i);
  if (!matched) {
    throw new Error("快速初判格式无效。");
  }

  return {
    score: Math.max(0, Math.min(100, Number.parseInt(matched[1], 10))),
    verdictType: matched[2].toUpperCase() as VerdictStatus,
  };
}

export function parseQuoteSelection(raw: string): QuoteSelection {
  const parts = raw.trim().split("|").map((part) => part.trim());
  if (parts.length < 3) {
    throw new Error("判词选择格式无效。");
  }

  const [choice, en, ...rest] = parts;
  return {
    choice: (choice || "A") as "A" | "B" | "C",
    en,
    zh: rest.join("|"),
  };
}

export function parseQuoteSelectionPreview(raw: string) {
  const parts = raw.trim().split("|");
  return {
    choice: parts[0]?.trim() ?? "",
    en: parts[1]?.trim() ?? "",
    zh: parts.slice(2).join("|").trim(),
  };
}

export function parseDeepAnalysis(raw: string): DeepAnalysis {
  const matched = raw.match(/\{[\s\S]*\}/);
  if (!matched) {
    throw new Error("详细分析不是有效 JSON。");
  }

  const parsed = JSON.parse(matched[0]) as {
    fatalFlaws?: string[];
    solidPillars?: string[];
  };

  return {
    fatalFlaws: (parsed.fatalFlaws ?? []).slice(0, 3).map((item) => clipText(item, 25)),
    solidPillars: (parsed.solidPillars ?? []).slice(0, 3).map((item) => clipText(item, 25)),
  };
}

export function parseConvergenceDivergence(raw: string) {
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const convergenceLine = lines.find((line) => line.startsWith("CONVERGENCE|"));
  const divergenceLine = lines.find((line) => line.startsWith("DIVERGENCE|"));

  return {
    convergence: convergenceLine?.split("|").slice(1).join("|").trim() ?? "",
    divergence: divergenceLine?.split("|").slice(1).join("|").trim() ?? "",
  };
}

export function parseCourtCommentary(raw: string) {
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const enLine = lines.find((line) => line.startsWith("EN|"));
  const zhLine = lines.find((line) => line.startsWith("ZH|"));

  return {
    en: enLine?.split("|").slice(1).join("|").trim() ?? "",
    zh: zhLine?.split("|").slice(1).join("|").trim() ?? "",
  };
}
