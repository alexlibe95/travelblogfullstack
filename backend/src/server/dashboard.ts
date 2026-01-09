import ParseDashboard from 'parse-dashboard';
import { Application } from 'express';
import { env } from '../utils/env.js';
import { ENVIRONMENTS, ROUTES } from '../../constants/index.js';

export function setupDashboard(app: Application) {
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
}
