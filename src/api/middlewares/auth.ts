// 认证中间件
import { Request, Response, NextFunction } from 'express';
import { config } from '../../config';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header');
  }
  
  const token = authHeader.slice(7);
  
  if (token !== config.validToken) {
    throw new ForbiddenError('Invalid token');
  }
  
  next();
}
