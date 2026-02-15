// Express 配置
import express, { Application } from 'express';
import cors from 'cors';
import { authMiddleware } from '../api/middlewares/auth';
import { errorHandler } from '../api/middlewares/errorHandler';
import { requestLogger } from '../api/middlewares/requestLogger';
import routes from '../api';

export function loadExpress(app: Application): void {
  // 基础中间件
  app.use(cors());
  app.use(express.json());
  
  // 请求日志
  app.use(requestLogger);
  
  // 认证中间件
  app.use(authMiddleware);
  
  // 路由
  app.use(routes);
  
  // 错误处理（必须在最后）
  app.use(errorHandler);
}
