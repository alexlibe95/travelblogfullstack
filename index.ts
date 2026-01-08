import 'dotenv/config';
import { createServer } from './src/server/app.js';
import { env } from './src/utils/env.js';

const app = await createServer();

const port = parseInt(env.SERVER_PORT, 10);
const server = app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`⚙️  Parse Server running on http://localhost:${port}/parse`);
  console.log(`📊 Dashboard running on http://localhost:${port}/dashboard`);
  console.log(`❤️  Health Check running on http://localhost:${port}/health`);
});

process.on('SIGTERM', () => {
  console.log('\nSIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});
