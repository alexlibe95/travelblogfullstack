import express from 'express';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { securityHeaders, corsMiddleware, rateLimitMiddleware } from '../middleware/security.js';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler.js';
import { setupParse } from './parse.js';
import { setupDashboard } from './dashboard.js';
import { registerRoutes } from '../routes/index.js';
import { ROUTES } from '../../constants/index.js';

const __dirname = path.resolve();

export async function createServer() {
  const app = express();

  // Security
  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(rateLimitMiddleware);

  // Body parsing (exclude dashboard)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith(ROUTES.DASHBOARD)) return next();
    express.json()(req, res, next);
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith(ROUTES.DASHBOARD)) return next();
    express.urlencoded({ extended: true })(req, res, next);
  });

  // Static assets
  app.use(ROUTES.PUBLIC, express.static(path.join(__dirname, 'public')));

  // Parse
  await setupParse(app);

  // Dashboard
  setupDashboard(app);

  // Routes
  registerRoutes(app);

  // Errors
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
