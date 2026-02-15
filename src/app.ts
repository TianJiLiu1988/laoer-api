// 应用入口
import express from 'express';
import { loadAll, logger } from './loaders';
import { config } from './config';

async function startServer(): Promise<void> {
  const app = express();
  
  await loadAll(app);
  
  app.listen(config.port, '0.0.0.0', () => {
    logger.info(`Laoer API server running on port ${config.port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
