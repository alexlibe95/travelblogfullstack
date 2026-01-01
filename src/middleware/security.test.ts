import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { corsMiddleware, securityHeaders } from './security.js';

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
      method: 'GET',
      headers: {},
    };
    mockNext = vi.fn();
  });

  describe('securityHeaders', () => {
    it('should set X-Frame-Options header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(setHeaderMock).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should set X-Content-Type-Options header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(setHeaderMock).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    });

    it('should set X-XSS-Protection header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(setHeaderMock).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
    });

    it('should set Referrer-Policy header', () => {
      securityHeaders(mockRequest as Request, mockResponse as Response, mockNext);

      expect(setHeaderMock).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
    });
  });

  describe('corsMiddleware', () => {
    it('should set CORS headers for allowed origin in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      mockRequest.headers = { origin: 'http://localhost:3000' };

      corsMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(setHeaderMock).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://localhost:3000');
      expect(setHeaderMock).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      expect(mockNext).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle OPTIONS request', () => {
      mockRequest.method = 'OPTIONS';

      corsMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(sendStatusMock).toHaveBeenCalledWith(204);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should set Access-Control-Allow-Credentials header', () => {
      corsMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(setHeaderMock).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
    });

    it('should set Access-Control-Max-Age header', () => {
      corsMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(setHeaderMock).toHaveBeenCalledWith('Access-Control-Max-Age', '86400');
    });
  });
});

