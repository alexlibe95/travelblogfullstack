import { Application } from 'express';
import { healthRoutes } from './health.routes.js';
import { islandRoutes } from './islands.routes.js';
import { rootRoutes } from './root.routes.js';
import { searchRoutes } from './search.routes.js';
import { authRoutes } from './auth.routes.js';

export function registerRoutes(app: Application) {
  app.use(authRoutes);
  app.use(islandRoutes);
  app.use(searchRoutes);
  app.use(healthRoutes);
  app.use(rootRoutes);
}
