// 小弟路由
import { Router, Request, Response, NextFunction } from 'express';
import { subagentService } from '../../services/subagent.service';

const router = Router();

/**
 * GET /subagents - 获取所有小弟及其状态
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subagents = await subagentService.getAllSubagents();
    res.json({ subagents });
  } catch (error) {
    next(error);
  }
});

export default router;
