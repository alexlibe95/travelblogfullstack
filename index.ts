import 'dotenv/config';
import { createServer } from './src/server/app.js';
import { env } from './src/utils/env.js';

const app = await createServer();

const port = parseInt(env.SERVER_PORT, 10);
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Parse Server running on http://localhost:${port}/parse`);
  console.log(`Dashboard running on http://localhost:${port}/dashboard`);
  console.log(`Health Check running on http://localhost:${port}/health`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
