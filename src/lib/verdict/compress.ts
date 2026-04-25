import type { DebateMessage } from "@/lib/store/debate";

function cleanContent(content: string) {
  return content
    .replace(/[`*_>#-]/g, " ")
    .replace(/:[a-z_]+:/gi, " ")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isSmallTalk(content: string) {
  return /^(好的|收到|继续|嗯|好吧|谢谢|明白|ok|okay|sure)[.!?。！ ]*$/i.test(content);
}

export function compressConversation(statement: string, messages: DebateMessage[]): string {
  const normalizedMessages = messages
    .map((message) => ({
      role: message.role === "agent" ? "Advocate" : "User",
      content: cleanContent(message.content),
    }))
    .filter((message) => message.content && !isSmallTalk(message.content));

  const keptMessages =
    normalizedMessages.length > 12 ? normalizedMessages.slice(-12) : normalizedMessages;

  return [
    "[USER_STATEMENT]",
    cleanContent(statement),
    "[DEBATE_TURNS]",
    ...keptMessages.map((message) => `${message.role}: ${message.content}`),
  ].join("\n");
}
