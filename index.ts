import 'dotenv/config';
import express from 'express';
import { ParseServer } from 'parse-server';
import ParseDashboard from 'parse-dashboard';
import path from 'path';

import { config } from './config.js';
import { ROUTES } from './constants/index.js';
import { env } from './src/utils/env.js';
import { corsMiddleware, securityHeaders } from './src/middleware/security.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';

const __dirname = path.resolve();
const app = express();

// Security middleware (must be early in the chain)
app.use(securityHeaders);
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (needed for Parse Dashboard)
app.use(ROUTES.PUBLIC, express.static(path.join(__dirname, 'public')));

// Health check endpoint (for monitoring)
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

// Mount Parse Server
const parseServer = new ParseServer(config);
await parseServer.start();
app.use(ROUTES.PARSE, parseServer.app);

// Parse Dashboard
// Only allow insecure HTTP in development
const dashboard = new ParseDashboard(
  {
    apps: [
      {
        serverURL: env.SERVER_URL,
        appId: env.APP_ID,
        masterKey: env.MASTER_KEY,
        appName: env.APP_NAME,
      },
    ],
    users: [
      {
        user: env.APP_USER,
        pass: env.APP_PASS,
      },
    ],
  },
  {
    allowInsecureHTTP: env.NODE_ENV === 'development',
  }
);

app.use(ROUTES.DASHBOARD, dashboard);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'Parse Server is running 🚀',
    version: '1.0.0',
    endpoints: {
      parse: ROUTES.PARSE,
      dashboard: ROUTES.DASHBOARD,
      health: ROUTES.HEALTH,
    },
  });
});

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server with graceful shutdown handling
const port = parseInt(env.SERVER_PORT, 10);
const server = app.listen(port, () => {
  console.log(`🚀 Parse Server running at http://localhost:${port}${ROUTES.PARSE}`);
  console.log(`📊 Dashboard available at http://localhost:${port}${ROUTES.DASHBOARD}`);
  console.log(`💚 Health check available at http://localhost:${port}${ROUTES.HEALTH}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string): void => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    console.log('HTTP server closed.');

    // Close Parse Server connections
    parseServer
      .handleShutdown()
      .then(() => {
        console.log('Parse Server shutdown complete.');
        process.exit(0);
      })
      .catch((err: unknown) => {
        console.error('Error during Parse Server shutdown:', err);
        process.exit(1);
      });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});
