import 'dotenv/config';
import express from 'express';
import { ParseServer } from 'parse-server';
import ParseDashboard from 'parse-dashboard';
import Parse from 'parse/node.js';
import path from 'path';
import { readFileSync } from 'fs';
import { config } from './config.js';
import {
  ENVIRONMENTS,
  HTTP_STATUS,
  ROUTES,
  ISLAND_CLASS_NAME,
  ISLAND_FIELDS,
  ISLAND_LIST_FIELDS,
  ISLAND_DETAIL_FIELDS,
} from './constants/index.js';
import { env } from './src/utils/env.js';
import { corsMiddleware, securityHeaders } from './src/middleware/security.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import { ApplicationError } from './src/middleware/errorHandler.js';

const __dirname = path.resolve();

// Get version from package.json
const packageJson = JSON.parse(
  readFileSync(path.join(__dirname, 'package.json'), 'utf-8')
) as { version: string };
const VERSION = packageJson.version;

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
app.get(ROUTES.HEALTH, (_req, res) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    version: VERSION,
  });
});

// Mount Parse Server
const parseServer = new ParseServer(config);
await parseServer.start();
app.use(ROUTES.PARSE, parseServer.app);

// Initialize Parse SDK for server-side queries
Parse.initialize(env.APP_ID, env.MASTER_KEY);
Parse.serverURL = env.SERVER_URL;

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
    allowInsecureHTTP: env.NODE_ENV === ENVIRONMENTS.DEVELOPMENT,
  }
);

app.use(ROUTES.DASHBOARD, dashboard);

// API Routes
// Get all islands (basic info only)
app.get(ROUTES.ISLANDS, async (_req, res, next) => {
  try {
    const query = new Parse.Query(ISLAND_CLASS_NAME);
    // Sort by order field
    query.ascending(ISLAND_FIELDS.ORDER);
    // Select only basic fields for list view
    query.select(...ISLAND_LIST_FIELDS);

    const islands = await query.find({ useMasterKey: true });

    // Transform Parse objects to plain JSON with basic fields only
    const islandsData = islands.map((island) => {
      const data = island.toJSON();
      return {
        id: data[ISLAND_FIELDS.OBJECT_ID],
        title: data[ISLAND_FIELDS.TITLE],
        shortInfo: data[ISLAND_FIELDS.SHORT_INFO],
        photo: data[ISLAND_FIELDS.PHOTO],
        photoThumb: data[ISLAND_FIELDS.PHOTO_THUMB],
        order: data[ISLAND_FIELDS.ORDER],
      };
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: islandsData.length,
      data: islandsData,
    });
  } catch (error) {
    next(
      new ApplicationError(
        error instanceof Error ? error.message : 'Failed to fetch islands',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
});

// Get single island by ID (full details)
app.get(`${ROUTES.ISLANDS}/:id`, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ApplicationError('Island ID is required', HTTP_STATUS.BAD_REQUEST);
    }

    const query = new Parse.Query(ISLAND_CLASS_NAME);
    // Select all fields for detailed view
    query.select(...ISLAND_DETAIL_FIELDS);

    const island = await query.get(id, { useMasterKey: true });
    const data = island.toJSON();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        id: data[ISLAND_FIELDS.OBJECT_ID],
        title: data[ISLAND_FIELDS.TITLE],
        shortInfo: data[ISLAND_FIELDS.SHORT_INFO],
        description: data[ISLAND_FIELDS.DESCRIPTION],
        order: data[ISLAND_FIELDS.ORDER],
        url: data[ISLAND_FIELDS.URL],
        photo: data[ISLAND_FIELDS.PHOTO],
        photoThumb: data[ISLAND_FIELDS.PHOTO_THUMB],
        location: data[ISLAND_FIELDS.LOCATION],
        createdAt: data[ISLAND_FIELDS.CREATED_AT],
        updatedAt: data[ISLAND_FIELDS.UPDATED_AT],
      },
    });
  } catch (error) {
    if (error instanceof Parse.Error && error.code === Parse.Error.OBJECT_NOT_FOUND) {
      next(new ApplicationError('Island not found', HTTP_STATUS.NOT_FOUND));
    } else {
      next(
        new ApplicationError(
          error instanceof Error ? error.message : 'Failed to fetch island',
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
});

// Root endpoint
app.get(ROUTES.ROOT, (_req, res) => {
  res.json({
    message: 'Parse Server is running 🚀',
    version: VERSION,
    endpoints: {
      parse: ROUTES.PARSE,
      dashboard: ROUTES.DASHBOARD,
      health: ROUTES.HEALTH,
      api: {
        islands: ROUTES.ISLANDS,
      },
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
  console.log(`🔍 Version: ${VERSION}`);
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
