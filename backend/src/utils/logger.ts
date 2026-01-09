import pino from 'pino';
import { env } from './env.js';
import { ENVIRONMENTS } from '../../constants/index.js';

/**
 * Logger configuration
 * Uses Pino for fast, structured logging
 * - Development: Pretty printed logs with colors
 * - Production: JSON logs for log aggregation
 */
const loggerConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || (env.NODE_ENV === ENVIRONMENTS.PRODUCTION ? 'info' : 'debug'),
  ...(env.NODE_ENV === ENVIRONMENTS.DEVELOPMENT && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }),
};

export const logger = pino(loggerConfig);
