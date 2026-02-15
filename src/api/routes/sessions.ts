// 会话路由
import { Router, Request, Response, NextFunction } from 'express';
import { sessionService } from '../../services/session.service';

const router = Router();

/**
 * GET /subagents/:agentId/sessions - 获取某个小弟的会话列表
 */
router.get('/subagents/:agentId/sessions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { agentId } = req.params;
    const result = await sessionService.getSessionsForAgent(agentId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /subagents/:agentId/sessions/:sessionId/history - 获取会话历史
 */
router.get('/subagents/:agentId/sessions/:sessionId/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { agentId, sessionId } = req.params;
    const result = await sessionService.getSessionHistory(agentId, sessionId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sessions/:sessionKey/history - 通过 sessionKey 获取会话历史
 */
router.get('/api/sessions/:sessionKey/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionKey } = req.params;
    const result = await sessionService.getSessionHistoryByKey(sessionKey);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /sessions - 获取 main agent 的 sessions（兼容旧接口）
 */
router.get('/sessions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await sessionService.getMainSessions();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
