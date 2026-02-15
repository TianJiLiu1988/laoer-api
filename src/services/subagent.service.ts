// 小弟业务逻辑服务
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config';
import { SubagentWithStatus, SessionsJson, SessionsJsonEntry, SessionInfo } from '../models/subagent';
import { logger } from '../loaders/logger';

export class SubagentService {
  private readonly agentsDir: string;
  
  constructor() {
    this.agentsDir = config.agentsDir;
  }
  
  /**
   * 获取所有小弟及其状态
   */
  async getAllSubagents(): Promise<SubagentWithStatus[]> {
    const result: SubagentWithStatus[] = [];
    
    for (const agent of config.subagents) {
      const sessionsDir = path.join(this.agentsDir, agent.id, 'sessions');
      const sessionsFile = path.join(sessionsDir, 'sessions.json');
      
      let status: SubagentWithStatus['status'] = 'offline';
      let lastActiveAt: number | null = null;
      const currentTask: string | null = null;
      let sessions: SessionInfo[] = [];
      
      try {
        const content = await fs.readFile(sessionsFile, 'utf-8');
        const data: SessionsJson = JSON.parse(content);
        
        // sessions.json 是对象格式，key 是 sessionKey，value 是会话信息
        const sessionEntries = Object.entries(data).filter(
          (entry): entry is [string, SessionsJsonEntry] => {
            const val = entry[1];
            return typeof val === 'object' && val !== null && 'sessionId' in val;
          }
        );
        
        if (sessionEntries.length > 0) {
          // 转换为数组并按 updatedAt 排序
          const sortedSessions = sessionEntries
            .map(([key, val]) => ({ key, ...val }))
            .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          
          const latestSession = sortedSessions[0];
          lastActiveAt = latestSession.updatedAt || null;
          
          // 判断状态：30分钟内活跃为 idle
          const now = Date.now();
          if (lastActiveAt && now - lastActiveAt < config.idleThresholdMs) {
            status = 'idle';
          }
          
          // 获取会话列表（最多10个）
          sessions = sortedSessions.slice(0, 10).map(s => ({
            id: s.sessionId,
            key: s.key,
            updatedAt: s.updatedAt || 0,
            status: s.abortedLastRun ? 'interrupted' as const : 'completed' as const
          }));
        }
      } catch (err) {
        // 文件不存在或解析失败，保持 offline 状态
        logger.debug(`Failed to read sessions for ${agent.id}: ${err}`);
      }
      
      result.push({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        emoji: agent.emoji,
        status,
        lastActiveAt,
        currentTask,
        sessionCount: sessions.length,
        sessions
      });
    }
    
    return result;
  }
}

export const subagentService = new SubagentService();
