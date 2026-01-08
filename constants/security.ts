/**
 * Security-related constants
 */

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
  PATCH: 'PATCH',
} as const;

export const CORS_HEADERS = {
  ALLOW_ORIGIN: 'Access-Control-Allow-Origin',
  ALLOW_METHODS: 'Access-Control-Allow-Methods',
  ALLOW_HEADERS: 'Access-Control-Allow-Headers',
  ALLOW_CREDENTIALS: 'Access-Control-Allow-Credentials',
  MAX_AGE: 'Access-Control-Max-Age',
} as const;

export const SECURITY_HEADERS = {
  FRAME_OPTIONS: 'X-Frame-Options',
  CONTENT_TYPE_OPTIONS: 'X-Content-Type-Options',
  XSS_PROTECTION: 'X-XSS-Protection',
  REFERRER_POLICY: 'Referrer-Policy',
  CONTENT_SECURITY_POLICY: 'Content-Security-Policy',
  STRICT_TRANSPORT_SECURITY: 'Strict-Transport-Security',
} as const;

export const SECURITY_VALUES = {
  FRAME_OPTIONS_DENY: 'DENY',
  CONTENT_TYPE_NOSNIFF: 'nosniff',
  XSS_PROTECTION: '1; mode=block',
  REFERRER_POLICY: 'strict-origin-when-cross-origin',
  CSP_DEFAULT:
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  HSTS_MAX_AGE: 'max-age=31536000; includeSubDomains',
  CORS_MAX_AGE: '86400', // 24 hours
  CORS_ALLOW_CREDENTIALS: 'true',
  HTTPS_ONLY: 'https://',
} as const;

export const ALLOWED_METHODS = [
  HTTP_METHODS.GET,
  HTTP_METHODS.POST,
  HTTP_METHODS.PUT,
  HTTP_METHODS.DELETE,
  HTTP_METHODS.OPTIONS,
  HTTP_METHODS.PATCH,
].join(', ');

export const PARSE_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Parse-Application-Id',
  'X-Parse-REST-API-Key',
].join(', ');

export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
} as const;

export const DEFAULT_DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:4200',
  'http://localhost:5173',
];
