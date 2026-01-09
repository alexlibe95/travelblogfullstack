import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger.js';
import { ROUTES } from '../../constants/index.js';

export const swaggerRoutes = Router();

swaggerRoutes.use(ROUTES.API.DOCS, swaggerUi.serve);
swaggerRoutes.get(ROUTES.API.DOCS, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Travel Blog API Documentation',
}));
