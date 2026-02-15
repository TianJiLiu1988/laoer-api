// 小弟相关类型定义

export type AgentStatus = 'online' | 'idle' | 'offline';

export interface SubagentBase {
  id: string;
  name: string;
  role: string;
  emoji: string;
}

export interface SessionInfo {
  id: string;
  key: string;
  updatedAt: number;
  status: 'completed' | 'interrupted';
}

export interface SubagentWithStatus extends SubagentBase {
  status: AgentStatus;
  lastActiveAt: number | null;
  currentTask: string | null;
  sessionCount: number;
  sessions: SessionInfo[];
}

// sessions.json 中的会话数据结构
export interface SessionsJsonEntry {
  sessionId: string;
  updatedAt?: number;
  model?: string;
  totalTokens?: number;
  abortedLastRun?: boolean;
  [key: string]: unknown;
}

export interface SessionsJson {
  [sessionKey: string]: SessionsJsonEntry | unknown;
}
