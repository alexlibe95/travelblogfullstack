import { Router } from 'express';
import path from 'path';
import { readFileSync } from 'fs';
import { Request, Response } from 'express';
import { ROUTES, HTTP_STATUS } from '../../constants/index.js';
import { env } from '../utils/env.js';

const __dirname = path.resolve();

// Read version once (startup-time)
const packageJson = JSON.parse(readFileSync(path.join(__dirname, 'package.json'), 'utf-8')) as {
  version: string;
};

export const healthRoutes = Router();

healthRoutes.get(ROUTES.HEALTH, (_req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    version: packageJson.version,
  });
});
