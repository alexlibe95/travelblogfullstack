import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../utils/env.js';
import {
  CORS_HEADERS,
  SECURITY_HEADERS,
  SECURITY_VALUES,
  ALLOWED_METHODS,
  PARSE_HEADERS,
  ENVIRONMENTS,
  DEFAULT_DEV_ORIGINS,
  HTTP_METHODS,
  RATE_LIMIT,
} from '../../constants/index.js';

/**
 * CORS configuration middleware
 */
export function corsMiddleware(_req: Request, res: Response, next: NextFunction): void {
  // In production, replace '*' with your frontend domain(s)
  const allowedOrigins =
    process.env.NODE_ENV === ENVIRONMENTS.PRODUCTION
      ? process.env.ALLOWED_ORIGINS?.split(',') || []
      : DEFAULT_DEV_ORIGINS;

  const origin = _req.headers.origin;

  // When credentials are allowed, we cannot use '*' - must specify exact origin
  // In development, allow any origin from the request if it's in our allowed list
  // or if it's a localhost origin (for flexibility during development)
  if (origin) {
    if (allowedOrigins.includes(origin)) {
      res.setHeader(CORS_HEADERS.ALLOW_ORIGIN, origin);
    } else if (
      process.env.NODE_ENV === ENVIRONMENTS.DEVELOPMENT &&
      origin.startsWith('http://localhost:')
    ) {
      // Allow any localhost origin in development for flexibility
      res.setHeader(CORS_HEADERS.ALLOW_ORIGIN, origin);
    }
  }

  res.setHeader(CORS_HEADERS.ALLOW_METHODS, ALLOWED_METHODS);
  res.setHeader(CORS_HEADERS.ALLOW_HEADERS, PARSE_HEADERS);
  res.setHeader(CORS_HEADERS.ALLOW_CREDENTIALS, SECURITY_VALUES.CORS_ALLOW_CREDENTIALS);
  res.setHeader(CORS_HEADERS.MAX_AGE, SECURITY_VALUES.CORS_MAX_AGE);

  if (_req.method === HTTP_METHODS.OPTIONS) {
    res.sendStatus(204);
    return;
  }

  next();
}

/**
 * Security headers middleware
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  // Prevent clickjacking
  res.setHeader(SECURITY_HEADERS.FRAME_OPTIONS, SECURITY_VALUES.FRAME_OPTIONS_DENY);

  // Prevent MIME type sniffing
  res.setHeader(SECURITY_HEADERS.CONTENT_TYPE_OPTIONS, SECURITY_VALUES.CONTENT_TYPE_NOSNIFF);

  // Enable XSS protection
  res.setHeader(SECURITY_HEADERS.XSS_PROTECTION, SECURITY_VALUES.XSS_PROTECTION);

  // Referrer Policy
  res.setHeader(SECURITY_HEADERS.REFERRER_POLICY, SECURITY_VALUES.REFERRER_POLICY);

  // Content Security Policy (adjust based on your needs)
  if (process.env.NODE_ENV === ENVIRONMENTS.PRODUCTION) {
    res.setHeader(SECURITY_HEADERS.CONTENT_SECURITY_POLICY, SECURITY_VALUES.CSP_DEFAULT);
  }

  // Strict Transport Security (only in production with HTTPS)
  if (
    process.env.NODE_ENV === ENVIRONMENTS.PRODUCTION &&
    env.SERVER_URL.startsWith(SECURITY_VALUES.HTTPS_ONLY)
  ) {
    res.setHeader(SECURITY_HEADERS.STRICT_TRANSPORT_SECURITY, SECURITY_VALUES.HSTS_MAX_AGE);
  }

  next();
}

/**
 * Rate limiting middleware
 * Uses express-rate-limit with different limits for development and production
 * In production with multiple servers, consider using Redis store
 */
export const rateLimitMiddleware = rateLimit({
  ...(process.env.NODE_ENV === ENVIRONMENTS.PRODUCTION
    ? RATE_LIMIT.PRODUCTION
    : RATE_LIMIT.DEVELOPMENT),
  // Skip rate limiting for health checks and dashboard
  skip: (req: Request) => {
    return (
      req.path === '/health' ||
      req.path.startsWith('/dashboard') ||
      req.path.startsWith('/api-docs')
    );
  },
});
