"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subagentService = exports.SubagentService = void 0;
// 小弟业务逻辑服务
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const logger_1 = require("../loaders/logger");
class SubagentService {
    agentsDir;
    constructor() {
        this.agentsDir = config_1.config.agentsDir;
    }
    /**
     * 获取所有小弟及其状态
     */
    async getAllSubagents() {
        const result = [];
        for (const agent of config_1.config.subagents) {
            const sessionsDir = path_1.default.join(this.agentsDir, agent.id, 'sessions');
            const sessionsFile = path_1.default.join(sessionsDir, 'sessions.json');
            let status = 'offline';
            let lastActiveAt = null;
            const currentTask = null;
            let sessions = [];
            try {
                const content = await promises_1.default.readFile(sessionsFile, 'utf-8');
                const data = JSON.parse(content);
                // sessions.json 是对象格式，key 是 sessionKey，value 是会话信息
                const sessionEntries = Object.entries(data).filter((entry) => {
                    const val = entry[1];
                    return typeof val === 'object' && val !== null && 'sessionId' in val;
                });
                if (sessionEntries.length > 0) {
                    // 转换为数组并按 updatedAt 排序
                    const sortedSessions = sessionEntries
                        .map(([key, val]) => ({ key, ...val }))
                        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
                    const latestSession = sortedSessions[0];
                    lastActiveAt = latestSession.updatedAt || null;
                    // 判断状态：30分钟内活跃为 idle
                    const now = Date.now();
                    if (lastActiveAt && now - lastActiveAt < config_1.config.idleThresholdMs) {
                        status = 'idle';
                    }
                    // 获取会话列表（最多10个）
                    sessions = sortedSessions.slice(0, 10).map(s => ({
                        id: s.sessionId,
                        key: s.key,
                        updatedAt: s.updatedAt || 0,
                        status: s.abortedLastRun ? 'interrupted' : 'completed'
                    }));
                }
            }
            catch (err) {
                // 文件不存在或解析失败，保持 offline 状态
                logger_1.logger.debug(`Failed to read sessions for ${agent.id}: ${err}`);
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
exports.SubagentService = SubagentService;
exports.subagentService = new SubagentService();
//# sourceMappingURL=subagent.service.js.map