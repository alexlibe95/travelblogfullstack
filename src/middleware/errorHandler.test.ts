import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { ApplicationError, errorHandler, asyncHandler, notFoundHandler } from './errorHandler.js';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn().mockReturnThis();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      status: statusMock as Response['status'],
      json: jsonMock as Response['json'],
    };
    mockRequest = {};
    mockNext = vi.fn();
  });

  describe('ApplicationError', () => {
    it('should create an error with default status code 500', () => {
      const error = new ApplicationError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it('should create an error with custom status code', () => {
      const error = new ApplicationError('Not found', 404);
      expect(error.statusCode).toBe(404);
    });

    it('should create an error with custom operational flag', () => {
      const error = new ApplicationError('Error', 500, false);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('errorHandler', () => {
    it('should handle ApplicationError correctly', () => {
      const error = new ApplicationError('Test error', 400);
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: {
          message: 'Test error',
          statusCode: 400,
        },
      });
    });

    it('should use default status code 500 for errors without statusCode', () => {
      const error = new Error('Generic error');
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: {
          message: 'Generic error',
          statusCode: 500,
        },
      });
    });

    it('should hide internal errors in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new ApplicationError('Internal error', 500);
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        error: {
          message: 'Internal Server Error',
          statusCode: 500,
        },
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should include stack trace in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new ApplicationError('Test error', 400);
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs.error.stack).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('asyncHandler', () => {
    it('should call the handler function', async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      const wrapped = asyncHandler(handler);

      await wrapped(mockRequest as Request, mockResponse as Response, mockNext);

      expect(handler).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
    });

    it('should catch and forward errors to next', async () => {
      const error = new Error('Async error');
      const handler = vi.fn().mockRejectedValue(error);
      const wrapped = asyncHandler(handler);

      await wrapped(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 status with error message', () => {
      notFoundHandler(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: {
          message: 'Route not found',
          statusCode: 404,
        },
      });
    });
  });
});

