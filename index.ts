import 'dotenv/config';
import express from 'express';
import { ParseServer } from 'parse-server';
import ParseDashboard from 'parse-dashboard';
import path from 'path';

import { config } from './config.js';
import { ROUTES } from './constants/index.js';

const __dirname = path.resolve();
const app = express();

// Serve static assets (needed for Parse Dashboard)
app.use(ROUTES.PUBLIC, express.static(path.join(__dirname, 'public')));

// Mount Parse Server
const parseServer = new ParseServer(config);
await parseServer.start();
app.use(ROUTES.PARSE, parseServer.app);

// Parse Dashboard
const dashboard = new ParseDashboard(
  {
    apps: [
      {
        serverURL: process.env.SERVER_URL!,
        appId: process.env.APP_ID!,
        masterKey: process.env.MASTER_KEY!,
        appName: process.env.APP_NAME!,
      },
    ],
    users: [
      {
        user: process.env.APP_USER!,
        pass: process.env.APP_PASS!,
      },
    ],
  },
  {
    allowInsecureHTTP: true,
  }
);

app.use(ROUTES.DASHBOARD, dashboard);

// Root
app.get('/', (_req, res) => {
  res.send('Parse Server is running 🚀');
});

// Start server
const port = process.env.SERVER_PORT!;
app.listen(port, () => {
  console.log(`Parse Server running at http://localhost:${port}${ROUTES.PARSE}`);
  console.log(`Dashboard available at http://localhost:${port}${ROUTES.DASHBOARD}`);
});
