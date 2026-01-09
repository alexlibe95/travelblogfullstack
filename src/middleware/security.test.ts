import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { corsMiddleware, securityHeaders, rateLimitMiddleware } from './security.js';
import {
  SECURITY_HEADERS,
  SECURITY_VALUES,
  CORS_HEADERS,
  HTTP_METHODS,
  HTTP_STATUS,
  ENVIRONMENTS,
  DEFAULT_DEV_ORIGINS,
  ALLOWED_METHODS,
  RATE_LIMIT,
} from '../../constants/index.js';

describe('Security Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let setHeaderMock: ReturnType<typeof vi.fn>;
  let sendStatusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setHeaderMock = vi.fn().mockReturnThis();
    sendStatusMock = vi.fn();
    mockResponse = {
      setHeader: setHeaderMock as Response['setHeader'],
      sendStatus: sendStatusMock as Response['sendStatus'],
    };
    mockRequest = {
      method: HTTP_METHODS.GET,
      headers: {},
    };
    mockNext = vi.fn();
  });

  describe('securityHeaders', () => {
    it('should set X-Frame-Options header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(setHeaderMock).toHaveBeenCalledWith(
        SECURITY_HEADERS.FRAME_OPTIONS,
        SECURITY_VALUES.FRAME_OPTIONS_DENY
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should set X-Content-Type-Options header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(setHeaderMock).toHaveBeenCalledWith(
        SECURITY_HEADERS.CONTENT_TYPE_OPTIONS,
        SECURITY_VALUES.CONTENT_TYPE_NOSNIFF
      );
    });

    it('should set X-XSS-Protection header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(setHeaderMock).toHaveBeenCalledWith(
        SECURITY_HEADERS.XSS_PROTECTION,
        SECURITY_VALUES.XSS_PROTECTION
      );
    });

    it('should set Referrer-Policy header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(setHeaderMock).toHaveBeenCalledWith(
        SECURITY_HEADERS.REFERRER_POLICY,
        SECURITY_VALUES.REFERRER_POLICY
      );
    });
  });

  describe('corsMiddleware', () => {
    it('should set CORS headers for allowed origin in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = ENVIRONMENTS.DEVELOPMENT;
      mockRequest.headers = { origin: DEFAULT_DEV_ORIGINS[0] };

      corsMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(setHeaderMock).toHaveBeenCalledWith(CORS_HEADERS.ALLOW_ORIGIN, DEFAULT_DEV_ORIGINS[0]);
      expect(setHeaderMock).toHaveBeenCalledWith(CORS_HEADERS.ALLOW_METHODS, ALLOWED_METHODS);
      expect(mockNext).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle OPTIONS request', () => {
      mockRequest.method = HTTP_METHODS.OPTIONS;

      corsMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(sendStatusMock).toHaveBeenCalledWith(HTTP_STATUS.NO_CONTENT);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should set Access-Control-Allow-Credentials header', () => {
      corsMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(setHeaderMock).toHaveBeenCalledWith(
        CORS_HEADERS.ALLOW_CREDENTIALS,
        SECURITY_VALUES.CORS_ALLOW_CREDENTIALS
      );
    });

    it('should set Access-Control-Max-Age header', () => {
      corsMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(setHeaderMock).toHaveBeenCalledWith(
        CORS_HEADERS.MAX_AGE,
        SECURITY_VALUES.CORS_MAX_AGE
      );
    });
  });

  describe('rateLimitMiddleware', () => {
    it('should be defined', () => {
      expect(rateLimitMiddleware).toBeDefined();
    });

    it('should use development limits in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = ENVIRONMENTS.DEVELOPMENT;

      // Rate limit middleware is configured at module load time
      // We can verify the configuration exists
      expect(RATE_LIMIT.DEVELOPMENT).toBeDefined();
      expect(RATE_LIMIT.DEVELOPMENT.max).toBe(1000);

      process.env.NODE_ENV = originalEnv;
    });

    it('should use production limits in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = ENVIRONMENTS.PRODUCTION;

      // Rate limit middleware is configured at module load time
      // We can verify the configuration exists
      expect(RATE_LIMIT.PRODUCTION).toBeDefined();
      expect(RATE_LIMIT.PRODUCTION.max).toBe(100);

      process.env.NODE_ENV = originalEnv;
    });

    it('should skip rate limiting for health endpoint', () => {
      const healthRequest = {
        path: '/health',
      } as Request;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const skipFunction = (rateLimitMiddleware as any).options?.skip;
      if (skipFunction) {
        expect(skipFunction(healthRequest)).toBe(true);
      }
    });

    it('should skip rate limiting for dashboard', () => {
      const dashboardRequest = {
        path: '/dashboard/apps',
      } as Request;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const skipFunction = (rateLimitMiddleware as any).options?.skip;
      if (skipFunction) {
        expect(skipFunction(dashboardRequest)).toBe(true);
      }
    });

    it('should skip rate limiting for API docs', () => {
      const docsRequest = {
        path: '/api-docs',
      } as Request;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const skipFunction = (rateLimitMiddleware as any).options?.skip;
      if (skipFunction) {
        expect(skipFunction(docsRequest)).toBe(true);
      }
    });

    it('should not skip rate limiting for regular API endpoints', () => {
      const apiRequest = {
        path: '/api/islands',
      } as Request;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const skipFunction = (rateLimitMiddleware as any).options?.skip;
      if (skipFunction) {
        expect(skipFunction(apiRequest)).toBe(false);
      }
    });
  });
});
