import { Request, Response, NextFunction } from 'express';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  ERROR_RESPONSE_KEYS,
  LOG_KEYS,
  ENVIRONMENTS,
} from '../../constants/index.js';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Custom error class for application errors
 */
export class ApplicationError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Express error handling middleware
 * Should be added after all routes
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const isOperational = err.isOperational !== false;

  // Log error for debugging
  console.error(LOG_KEYS.ERROR, {
    [LOG_KEYS.MESSAGE]: err.message,
    [LOG_KEYS.STATUS_CODE]: statusCode,
    [LOG_KEYS.STACK]: process.env.NODE_ENV === ENVIRONMENTS.DEVELOPMENT ? err.stack : undefined,
    [LOG_KEYS.IS_OPERATIONAL]: isOperational,
  });

  // Don't expose internal errors in production
  const message =
    statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR &&
    process.env.NODE_ENV === ENVIRONMENTS.PRODUCTION
      ? ERROR_MESSAGES.INTERNAL_SERVER_ERROR
      : err.message;

  res.status(statusCode).json({
    [ERROR_RESPONSE_KEYS.ERROR]: {
      [ERROR_RESPONSE_KEYS.MESSAGE]: message,
      [ERROR_RESPONSE_KEYS.STATUS_CODE]: statusCode,
      ...(process.env.NODE_ENV === ENVIRONMENTS.DEVELOPMENT && {
        [ERROR_RESPONSE_KEYS.STACK]: err.stack,
      }),
    },
  });
}

/**
 * Async error wrapper to catch errors in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    [ERROR_RESPONSE_KEYS.ERROR]: {
      [ERROR_RESPONSE_KEYS.MESSAGE]: ERROR_MESSAGES.ROUTE_NOT_FOUND,
      [ERROR_RESPONSE_KEYS.STATUS_CODE]: HTTP_STATUS.NOT_FOUND,
    },
  });
}
