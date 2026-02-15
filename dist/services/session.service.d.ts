import { SessionDetail, SessionHistoryResponse, SessionKeyHistoryResponse } from '../models/session';
export declare class SessionService {
    private readonly agentsDir;
    constructor();
    /**
     * 获取某个小弟的会话列表
     */
    getSessionsForAgent(agentId: string): Promise<{
        agentId: string;
        sessions: SessionDetail[];
    }>;
    /**
     * 获取会话历史（通过 agentId 和 sessionId）
     */
    getSessionHistory(agentId: string, sessionId: string): Promise<SessionHistoryResponse>;
    /**
     * 获取会话历史（通过 sessionKey）
     */
    getSessionHistoryByKey(sessionKey: string): Promise<SessionKeyHistoryResponse>;
    /**
     * 获取 main agent 的 sessions.json（兼容旧接口）
     */
    getMainSessions(): Promise<unknown>;
    /**
     * 查找历史文件（可能有 .deleted 后缀）
     */
    private findHistoryFile;
}
export declare const sessionService: SessionService;
//# sourceMappingURL=session.service.d.ts.map