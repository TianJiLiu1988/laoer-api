// 加载器入口
import { Application } from 'express';
import { loadExpress } from './express';
import { logger } from './logger';

export async function loadAll(app: Application): Promise<void> {
  loadExpress(app);
  logger.info('Express loaded');
}

export { logger };
