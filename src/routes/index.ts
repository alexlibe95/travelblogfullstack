import { Application } from 'express';
import { healthRoutes } from './health.routes.js';
import { islandRoutes } from './islands.routes.js';
import { rootRoutes } from './root.routes.js';

export function registerRoutes(app: Application) {
  app.use(rootRoutes);
  app.use(healthRoutes);
  app.use(islandRoutes);
}
