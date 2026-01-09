import { Router } from 'express';
import { Request, Response } from 'express';
import { ROUTES } from '../../constants/index.js';

export const rootRoutes = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Root endpoint
 *     description: Returns server information and available endpoints
 *     responses:
 *       200:
 *         description: Server information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Parse Server is running 🚀
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     parse:
 *                       type: string
 *                       example: /parse
 *                     dashboard:
 *                       type: string
 *                       example: /dashboard
 *                     health:
 *                       type: string
 *                       example: /health
 *                     api:
 *                       type: object
 */
rootRoutes.get(ROUTES.ROOT, (_req: Request, res: Response) => {
  res.json({
    message: 'Parse Server is running 🚀',
    endpoints: {
      parse: ROUTES.PARSE,
      dashboard: ROUTES.DASHBOARD,
      health: ROUTES.HEALTH,
      docs: ROUTES.API.DOCS,
      api: {
        islands: ROUTES.API.ISLANDS,
        search: ROUTES.API.SEARCH,
        auth: {
          login: ROUTES.API.AUTH.LOGIN,
          logout: ROUTES.API.AUTH.LOGOUT,
        },
      },
    },
  });
});
