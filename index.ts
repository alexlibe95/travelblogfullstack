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

// Body parsing middleware (exclude dashboard routes - Parse Dashboard has its own body parser)
app.use((req, res, next) => {
  // Skip body parsing for dashboard routes
  if (req.path.startsWith(ROUTES.DASHBOARD)) {
    return next();
  }
  express.json()(req, res, next);
});

app.use((req, res, next) => {
  // Skip body parsing for dashboard routes
  if (req.path.startsWith(ROUTES.DASHBOARD)) {
    return next();
  }
  express.urlencoded({ extended: true })(req, res, next);
});

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

// Start server
const port = parseInt(env.SERVER_PORT, 10);
const server = app.listen(port, () => {
  console.log(`🚀 Parse Server running at http://localhost:${port}${ROUTES.PARSE}`);
  console.log(`📊 Dashboard available at http://localhost:${port}${ROUTES.DASHBOARD}`);
  console.log(`💚 Health check available at http://localhost:${port}${ROUTES.HEALTH}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nSIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});
