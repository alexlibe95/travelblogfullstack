import { Server } from 'http';
import { logger } from './logger.js';

let isShuttingDown = false;
let shutdownTimeout: NodeJS.Timeout | null = null;

export function gracefulShutdown(server: Server, signal: string): void {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  logger.info(`${signal} received. Shutting down gracefully...`);

  // Set timeout for forced shutdown if graceful shutdown takes too long
  shutdownTimeout = setTimeout(() => {
    logger.warn('Graceful shutdown taking too long, forcing exit...');
    process.exit(1);
  }, 3000);

  // Stop accepting new connections
  server.close(() => {
    // Clear the timeout since shutdown completed successfully
    if (shutdownTimeout) {
      clearTimeout(shutdownTimeout);
      shutdownTimeout = null;
    }
    logger.info('Server closed successfully');
    process.exit(0);
  });

  // Force close all active connections immediately
  if (typeof server.closeAllConnections === 'function') {
    server.closeAllConnections();
  }
}

export function setupShutdownHandlers(server: Server): void {
  process.on('SIGTERM', () => gracefulShutdown(server, 'SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown(server, 'SIGINT'));
}
