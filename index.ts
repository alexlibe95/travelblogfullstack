import 'dotenv/config';
import { createServer } from './src/server/app.js';
import { env } from './src/utils/env.js';
import { logger } from './src/utils/logger.js';

const app = await createServer();

const port = parseInt(env.SERVER_PORT, 10);
const server = app.listen(port, () => {
  logger.info(`🚀 Server running on http://localhost:${port}`);
  logger.info(`⚙️  Parse Server running on http://localhost:${port}/parse`);
  logger.info(`📊 Dashboard running on http://localhost:${port}/dashboard`);
  logger.info(`❤️  Health Check running on http://localhost:${port}/health`);
  logger.info(`📚 API Documentation running on http://localhost:${port}/api-docs`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed successfully');
    process.exit(0);
  });
});
