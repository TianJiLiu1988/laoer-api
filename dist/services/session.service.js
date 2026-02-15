"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionService = exports.SessionService = void 0;
// 会话业务逻辑服务
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const jsonl_1 = require("../utils/jsonl");
const errors_1 = require("../utils/errors");
class SessionService {
    agentsDir;
    constructor() {
        this.agentsDir = config_1.config.agentsDir;
    }
    /**
     * 获取某个小弟的会话列表
     */
    async getSessionsForAgent(agentId) {
        const sessionsDir = path_1.default.join(this.agentsDir, agentId, 'sessions');
        const sessionsFile = path_1.default.join(sessionsDir, 'sessions.json');
        try {
            const content = await promises_1.default.readFile(sessionsFile, 'utf-8');
            const data = JSON.parse(content);
            const sessionEntries = Object.entries(data).filter((entry) => {
                const val = entry[1];
                return typeof val === 'object' && val !== null && 'sessionId' in val;
            });
            const sortedSessions = sessionEntries
                .map(([key, val]) => ({ key, ...val }))
                .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
            const sessions = sortedSessions.map(s => ({
                id: s.sessionId,
                key: s.key,
                updatedAt: s.updatedAt || 0,
                model: s.model,
                totalTokens: s.totalTokens,
                status: s.abortedLastRun ? 'interrupted' : 'completed'
            }));
            return { agentId, sessions };
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                return { agentId, sessions: [] };
            }
            throw err;
        }
    }
    /**
     * 获取会话历史（通过 agentId 和 sessionId）
     */
    async getSessionHistory(agentId, sessionId) {
        const sessionsDir = path_1.default.join(this.agentsDir, agentId, 'sessions');
        const historyFile = await this.findHistoryFile(sessionsDir, sessionId);
        const content = await promises_1.default.readFile(historyFile, 'utf-8');
        const messages = (0, jsonl_1.parseJsonlContent)(content);
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
    async getSessionHistoryByKey(sessionKey) {
        // 解析 sessionKey: agent:{agentId}:subagent:{uuid}
        const parts = sessionKey.split(':');
        if (parts.length < 4 || parts[0] !== 'agent' || parts[2] !== 'subagent') {
            throw new errors_1.BadRequestError('Invalid sessionKey format. Expected: agent:{agentId}:subagent:{uuid}');
        }
        const agentId = parts[1];
        const sessionsDir = path_1.default.join(this.agentsDir, agentId, 'sessions');
        const sessionsFile = path_1.default.join(sessionsDir, 'sessions.json');
        // 从 sessions.json 中查找 sessionId
        let sessionId;
        try {
            const sessionsContent = await promises_1.default.readFile(sessionsFile, 'utf-8');
            const sessionsData = JSON.parse(sessionsContent);
            const sessionInfo = sessionsData[sessionKey];
            if (!sessionInfo?.sessionId) {
                throw new errors_1.NotFoundError('Session not found in sessions.json');
            }
            sessionId = sessionInfo.sessionId;
        }
        catch (err) {
            if (err instanceof errors_1.NotFoundError)
                throw err;
            throw new errors_1.NotFoundError('Failed to read sessions.json');
        }
        const historyFile = await this.findHistoryFile(sessionsDir, sessionId);
        const content = await promises_1.default.readFile(historyFile, 'utf-8');
        const messages = (0, jsonl_1.parseJsonlContent)(content);
        return { sessionKey, messages };
    }
    /**
     * 获取 main agent 的 sessions.json（兼容旧接口）
     */
    async getMainSessions() {
        const sessionsFile = path_1.default.join(this.agentsDir, 'main', 'sessions', 'sessions.json');
        const content = await promises_1.default.readFile(sessionsFile, 'utf-8');
        return JSON.parse(content);
    }
    /**
     * 查找历史文件（可能有 .deleted 后缀）
     */
    async findHistoryFile(sessionsDir, sessionId) {
        let historyFile = path_1.default.join(sessionsDir, `${sessionId}.jsonl`);
        try {
            await promises_1.default.access(historyFile);
            return historyFile;
        }
        catch {
            // 尝试找 .deleted 文件
            try {
                const files = await promises_1.default.readdir(sessionsDir);
                const deletedFile = files.find(f => f.startsWith(sessionId) && f.includes('.deleted'));
                if (deletedFile) {
                    return path_1.default.join(sessionsDir, deletedFile);
                }
            }
            catch {
                // ignore
            }
            throw new errors_1.NotFoundError('Session history not found');
        }
    }
}
exports.SessionService = SessionService;
exports.sessionService = new SessionService();
//# sourceMappingURL=session.service.js.map