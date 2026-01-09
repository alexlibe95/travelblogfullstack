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

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     description: Returns server health status and uptime
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 1234.56
 *                 environment:
 *                   type: string
 *                   example: development
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */
healthRoutes.get(ROUTES.HEALTH, (_req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    version: packageJson.version,
  });
});
