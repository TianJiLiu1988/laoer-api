// 错误处理中间件
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/errors';
import { logger } from '../../loaders/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn(`${err.statusCode} - ${err.message} - ${req.method} ${req.path}`);
    res.status(err.statusCode).json({
      error: err.message
    });
    return;
  }
  
  // 未知错误
  logger.error(`500 - ${err.message} - ${req.method} ${req.path}\n${err.stack}`);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message
  });
}
