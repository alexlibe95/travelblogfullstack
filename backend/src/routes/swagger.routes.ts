import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger.js';
import { ROUTES } from '../../constants/index.js';

export const swaggerRoutes = Router();

// Serve OpenAPI JSON spec for code generation
swaggerRoutes.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Serve Swagger UI
swaggerRoutes.use(ROUTES.API.DOCS, swaggerUi.serve);
swaggerRoutes.get(
  ROUTES.API.DOCS,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Travel Blog API Documentation',
  })
);
