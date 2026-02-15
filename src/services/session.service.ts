// 会话业务逻辑服务
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config';
import { SessionDetail, SessionHistoryResponse, SessionKeyHistoryResponse } from '../models/session';
import { SessionsJson, SessionsJsonEntry } from '../models/subagent';
import { ParsedMessage } from '../models/message';
import { parseJsonlContent } from '../utils/jsonl';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { logger } from '../loaders/logger';

export class SessionService {
  private readonly agentsDir: string;
  
  constructor() {
    this.agentsDir = config.agentsDir;
  }
  
  /**
   * 获取某个小弟的会话列表
   */
  async getSessionsForAgent(agentId: string): Promise<{ agentId: string; sessions: SessionDetail[] }> {
    const sessionsDir = path.join(this.agentsDir, agentId, 'sessions');
    const sessionsFile = path.join(sessionsDir, 'sessions.json');
    
    try {
      const content = await fs.readFile(sessionsFile, 'utf-8');
      const data: SessionsJson = JSON.parse(content);
      
      const sessionEntries = Object.entries(data).filter(
        (entry): entry is [string, SessionsJsonEntry] => {
          const val = entry[1];
          return typeof val === 'object' && val !== null && 'sessionId' in val;
        }
      );
      
      const sortedSessions = sessionEntries
        .map(([key, val]) => ({ key, ...val }))
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      
      const sessions: SessionDetail[] = sortedSessions.map(s => ({
        id: s.sessionId,
        key: s.key,
        updatedAt: s.updatedAt || 0,
        model: s.model,
        totalTokens: s.totalTokens,
        status: s.abortedLastRun ? 'interrupted' : 'completed'
      }));
      
      return { agentId, sessions };
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        return { agentId, sessions: [] };
      }
      throw err;
    }
  }
  
  /**
   * 获取会话历史（通过 agentId 和 sessionId）
   */
  async getSessionHistory(agentId: string, sessionId: string): Promise<SessionHistoryResponse> {
    const sessionsDir = path.join(this.agentsDir, agentId, 'sessions');
    const historyFile = await this.findHistoryFile(sessionsDir, sessionId);
    
    const content = await fs.readFile(historyFile, 'utf-8');
    const messages = parseJsonlContent(content);
    
    return {
      agentId,
      sessionId,
      messageCount: messages.length,
      messages
    };
  }
  
  /**
   * 获取会话历史（通过 sessionKey）
   */
  async getSessionHistoryByKey(sessionKey: string): Promise<SessionKeyHistoryResponse> {
    // 解析 sessionKey: agent:{agentId}:subagent:{uuid}
    const parts = sessionKey.split(':');
    if (parts.length < 4 || parts[0] !== 'agent' || parts[2] !== 'subagent') {
      throw new BadRequestError('Invalid sessionKey format. Expected: agent:{agentId}:subagent:{uuid}');
    }
    
    const agentId = parts[1];
    const sessionsDir = path.join(this.agentsDir, agentId, 'sessions');
    const sessionsFile = path.join(sessionsDir, 'sessions.json');
    
    // 从 sessions.json 中查找 sessionId
    let sessionId: string;
    try {
      const sessionsContent = await fs.readFile(sessionsFile, 'utf-8');
      const sessionsData: SessionsJson = JSON.parse(sessionsContent);
      const sessionInfo = sessionsData[sessionKey] as SessionsJsonEntry | undefined;
      
      if (!sessionInfo?.sessionId) {
        throw new NotFoundError('Session not found in sessions.json');
      }
      sessionId = sessionInfo.sessionId;
    } catch (err) {
      if (err instanceof NotFoundError) throw err;
      throw new NotFoundError('Failed to read sessions.json');
    }
    
    const historyFile = await this.findHistoryFile(sessionsDir, sessionId);
    const content = await fs.readFile(historyFile, 'utf-8');
    const messages = parseJsonlContent(content);
    
    return { sessionKey, messages };
  }
  
  /**
   * 获取 main agent 的 sessions.json（兼容旧接口）
   */
  async getMainSessions(): Promise<unknown> {
    const sessionsFile = path.join(this.agentsDir, 'main', 'sessions', 'sessions.json');
    const content = await fs.readFile(sessionsFile, 'utf-8');
    return JSON.parse(content);
  }
  
  /**
   * 查找历史文件（可能有 .deleted 后缀）
   */
  private async findHistoryFile(sessionsDir: string, sessionId: string): Promise<string> {
    let historyFile = path.join(sessionsDir, `${sessionId}.jsonl`);
    
    try {
      await fs.access(historyFile);
      return historyFile;
    } catch {
      // 尝试找 .deleted 文件
      try {
        const files = await fs.readdir(sessionsDir);
        const deletedFile = files.find(f => f.startsWith(sessionId) && f.includes('.deleted'));
        if (deletedFile) {
          return path.join(sessionsDir, deletedFile);
        }
      } catch {
        // ignore
      }
      throw new NotFoundError('Session history not found');
    }
  }
}

export const sessionService = new SessionService();
