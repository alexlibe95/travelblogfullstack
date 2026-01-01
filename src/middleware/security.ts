import { Request, Response, NextFunction } from 'express';
import { env } from '../utils/env.js';

/**
 * CORS configuration middleware
 */
export function corsMiddleware(_req: Request, res: Response, next: NextFunction): void {
  // In production, replace '*' with your frontend domain(s)
  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? process.env.ALLOWED_ORIGINS?.split(',') || []
      : ['http://localhost:3000', 'http://localhost:4200', 'http://localhost:5173'];

  const origin = _req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Parse-Application-Id, X-Parse-REST-API-Key'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  if (_req.method === 'OPTIONS') {
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
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy (adjust based on your needs)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    );
  }

  // Strict Transport Security (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production' && env.SERVER_URL.startsWith('https://')) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}

/**
 * Rate limiting configuration
 * Note: For production, consider using express-rate-limit with Redis
 */
export function rateLimitMiddleware(_req: Request, res: Response, next: NextFunction): void {
  // Basic rate limiting - in production, use express-rate-limit with Redis
  // This is a placeholder for the concept
  next();
}
