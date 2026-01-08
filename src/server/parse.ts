import { ParseServer } from 'parse-server';
import Parse from 'parse/node.js';
import { Application } from 'express';
import { config } from '../../config.js';
import { env } from '../utils/env.js';
import { ROUTES } from '../../constants/index.js';

export async function setupParse(app: Application) {
  const parseServer = new ParseServer(config);
  await parseServer.start();

  app.use(ROUTES.PARSE, parseServer.app);

  Parse.initialize(env.APP_ID, env.MASTER_KEY);
  Parse.serverURL = env.SERVER_URL;
}
