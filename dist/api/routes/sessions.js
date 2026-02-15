"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 会话路由
const express_1 = require("express");
const session_service_1 = require("../../services/session.service");
const router = (0, express_1.Router)();
/**
 * GET /subagents/:agentId/sessions - 获取某个小弟的会话列表
 */
router.get('/subagents/:agentId/sessions', async (req, res, next) => {
    try {
        const { agentId } = req.params;
        const result = await session_service_1.sessionService.getSessionsForAgent(agentId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /subagents/:agentId/sessions/:sessionId/history - 获取会话历史
 */
router.get('/subagents/:agentId/sessions/:sessionId/history', async (req, res, next) => {
    try {
        const { agentId, sessionId } = req.params;
        const result = await session_service_1.sessionService.getSessionHistory(agentId, sessionId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/sessions/:sessionKey/history - 通过 sessionKey 获取会话历史
 */
router.get('/api/sessions/:sessionKey/history', async (req, res, next) => {
    try {
        const { sessionKey } = req.params;
        const result = await session_service_1.sessionService.getSessionHistoryByKey(sessionKey);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /sessions - 获取 main agent 的 sessions（兼容旧接口）
 */
router.get('/sessions', async (req, res, next) => {
    try {
        const result = await session_service_1.sessionService.getMainSessions();
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=sessions.js.map