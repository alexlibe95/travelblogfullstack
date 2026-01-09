import { Router } from 'express';
import { Request, Response } from 'express';
import { ROUTES } from '../../constants/index.js';

export const rootRoutes = Router();

rootRoutes.get(ROUTES.ROOT, (_req: Request, res: Response) => {
  res.json({
    message: 'Parse Server is running 🚀',
    endpoints: {
      parse: ROUTES.PARSE,
      dashboard: ROUTES.DASHBOARD,
      health: ROUTES.HEALTH,
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
