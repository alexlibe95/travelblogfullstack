import { Router } from 'express';
import path from 'path';
import { readFileSync } from 'fs';
import { Request, Response, NextFunction } from 'express';
import { ROUTES, HTTP_STATUS, ENVIRONMENTS } from '../../constants/index.js';
import { env } from '../utils/env.js';
import { performHealthCheck } from '../services/health.service.js';
import { ApplicationError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

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
 *     description: Returns comprehensive server health status including database and Parse Server connectivity
 *     responses:
 *       200:
 *         description: Server health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [ok, degraded, error]
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
 *                 checks:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [ok, error]
 *                         message:
 *                           type: string
 *                         responseTime:
 *                           type: number
 *                           description: Response time in milliseconds
 *                     parseServer:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [ok, error]
 *                         message:
 *                           type: string
 *                         responseTime:
 *                           type: number
 *                           description: Response time in milliseconds
 *       503:
 *         description: Service unavailable (when health checks fail)
 */
healthRoutes.get(ROUTES.HEALTH, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const healthCheck = await performHealthCheck(env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT, packageJson.version);

    // Return 503 if any critical check fails
    const statusCode = healthCheck.status === 'error' ? HTTP_STATUS.SERVICE_UNAVAILABLE : HTTP_STATUS.OK;

    res.status(statusCode).json(healthCheck);
  } catch (error) {
    // Log the error for debugging
    logger.error({ error }, 'Health check endpoint error');
    next(new ApplicationError('Health check failed', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
});
