// 路由入口
import { Router } from 'express';
import subagentsRouter from './routes/subagents';
import sessionsRouter from './routes/sessions';

const router = Router();

// 挂载路由
router.use('/subagents', subagentsRouter);
router.use(sessionsRouter);

export default router;
