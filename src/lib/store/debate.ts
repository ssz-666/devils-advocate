"use client";

import { openDB } from "idb";
import { create } from "zustand";

export type DebateStage = "statement" | "debate" | "verdict";
export type DebateMode = "single" | "furies" | "court";
export type DebateRole = "user" | "agent";
export type VerdictStatus = "UNRESOLVED" | "CONVICTED" | "ACQUITTED";
export type FlawWeight = "LOW" | "MEDIUM" | "HIGH";
export type PillarStrength = "TENTATIVE" | "STABLE" | "STRONG";

export type DebateMessage = {
  id: string;
  role: DebateRole;
  content: string;
  createdAt: number;
  speakerId?: string;
  speakerName?: string;
  accentColor?: string;
};

export type VerdictFlaw = {
  flaw: string;
  weight: FlawWeight;
};

export type VerdictPillar = {
  pillar: string;
  strength: PillarStrength;
};

export type VerdictData = {
  convictionScore: number;
  verdict: VerdictStatus;
  fatalFlaws: VerdictFlaw[];
  solidPillars: VerdictPillar[];
  sentence: string;
  sentenceZh: string;
  oneLiner: string;
  advocateRemark: string;
  meta?: {
    source: "request-a" | "request-b" | "request-c" | "assembled";
    status: "partial" | "final";
    generatedAt: number;
  };
};

export type DebateSession = {
  id: string;
  currentStage: DebateStage;
  statement: string;
  messages: DebateMessage[];
  startedAt: number;
  endedAt: number | null;
  mode: DebateMode;
  verdict: VerdictData | null;
  verdictNumber: string;
  updatedAt: number;
};

type DebateState = DebateSession & {
  startDebate: (statement: string, mode?: DebateMode) => void;
  setStage: (stage: DebateStage) => void;
  addMessage: (message: Omit<DebateMessage, "id" | "createdAt">) => string;
  updateMessage: (id: string, content: string) => void;
  clearMessages: () => void;
  setVerdict: (verdict: VerdictData) => Promise<void>;
  hydrateSession: (session: DebateSession) => void;
  endDebate: () => Promise<void>;
  reset: (mode?: DebateMode) => void;
};

const DB_NAME = "devils-advocate";
const STORE_NAME = "debate-sessions";

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createVerdictNumber(seed: string) {
  const source = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return String((source * 7919) % 900000 + 100000);
}

function createEmptySession(mode: DebateMode = "single"): DebateSession {
  const id = createId(mode);
  return {
    id,
    currentStage: "statement",
    statement: "",
    messages: [],
    startedAt: 0,
    endedAt: null,
    mode,
    verdict: null,
    verdictNumber: createVerdictNumber(id),
    updatedAt: Date.now(),
  };
}

async function getDebateDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
}

export async function saveDebateSession(session: DebateSession) {
  if (typeof window === "undefined") {
    return;
  }

  const db = await getDebateDb();
  await db.put(STORE_NAME, {
    ...session,
    updatedAt: Date.now(),
  });
}

export async function getDebateSession(id: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const db = await getDebateDb();
  return (await db.get(STORE_NAME, id)) as DebateSession | undefined;
}

export async function getDebateSessionWithTimeout(id: string, timeoutMs = 1800) {
  return Promise.race([
    getDebateSession(id),
    new Promise<null>((resolve) => {
      window.setTimeout(() => resolve(null), timeoutMs);
    }),
  ]);
}

export async function listDebateSessions() {
  if (typeof window === "undefined") {
    return [] as DebateSession[];
  }

  const db = await getDebateDb();
  const sessions = (await db.getAll(STORE_NAME)) as DebateSession[];
  return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteDebateSession(id: string) {
  if (typeof window === "undefined") {
    return;
  }

  const db = await getDebateDb();
  await db.delete(STORE_NAME, id);
}

export async function clearDebateSessions() {
  if (typeof window === "undefined") {
    return;
  }

  const db = await getDebateDb();
  await db.clear(STORE_NAME);
}

export async function exportDebateSessions() {
  return JSON.stringify(await listDebateSessions(), null, 2);
}

export async function importDebateSessions(sessions: DebateSession[]) {
  if (typeof window === "undefined") {
    return;
  }

  const db = await getDebateDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  for (const session of sessions) {
    await tx.store.put(session);
  }
  await tx.done;
}

export const useDebateStore = create<DebateState>((set, get) => ({
  ...createEmptySession("single"),
  startDebate: (statement, mode = "single") => {
    const base = createEmptySession(mode);
    set({
      ...base,
      currentStage: "debate",
      statement,
      startedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
  setStage: (currentStage) => set({ currentStage, updatedAt: Date.now() }),
  addMessage: (message) => {
    const id = createId(message.role);
    const nextMessage: DebateMessage = {
      ...message,
      id,
      createdAt: Date.now(),
    };
    set((state) => ({
      messages: [...state.messages, nextMessage],
      updatedAt: Date.now(),
    }));
    return id;
  },
  updateMessage: (id, content) => {
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === id ? { ...message, content } : message,
      ),
      updatedAt: Date.now(),
    }));
  },
  clearMessages: () => set({ messages: [], updatedAt: Date.now() }),
  setVerdict: async (verdict) => {
    set({ verdict, updatedAt: Date.now() });
    await saveDebateSession(get());
  },
  hydrateSession: (session) => set(session),
  endDebate: async () => {
    const endedAt = Date.now();
    set({ currentStage: "verdict", endedAt, updatedAt: endedAt });
    await saveDebateSession(get());
  },
  reset: (mode = "single") => set(createEmptySession(mode)),
}));
