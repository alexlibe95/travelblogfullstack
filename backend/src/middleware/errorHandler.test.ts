import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { ApplicationError, errorHandler, asyncHandler, notFoundHandler } from './errorHandler.js';
import { HTTP_STATUS, ERROR_MESSAGES, ERROR_RESPONSE_KEYS } from '../../constants/index.js';

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
      expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(error.isOperational).toBe(true);
    });

    it('should create an error with custom status code', () => {
      const error = new ApplicationError('Not found', HTTP_STATUS.NOT_FOUND);
      expect(error.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
    });

    it('should create an error with custom operational flag', () => {
      const error = new ApplicationError('Error', HTTP_STATUS.INTERNAL_SERVER_ERROR, false);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('errorHandler', () => {
    it('should handle ApplicationError correctly', () => {
      const error = new ApplicationError('Test error', HTTP_STATUS.BAD_REQUEST);
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(jsonMock).toHaveBeenCalledWith({
        [ERROR_RESPONSE_KEYS.ERROR]: {
          [ERROR_RESPONSE_KEYS.MESSAGE]: 'Test error',
          [ERROR_RESPONSE_KEYS.STATUS_CODE]: HTTP_STATUS.BAD_REQUEST,
        },
      });
    });

    it('should use default status code 500 for errors without statusCode', () => {
      const error = new Error('Generic error');
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toHaveBeenCalledWith({
        [ERROR_RESPONSE_KEYS.ERROR]: {
          [ERROR_RESPONSE_KEYS.MESSAGE]: 'Generic error',
          [ERROR_RESPONSE_KEYS.STATUS_CODE]: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        },
      });
    });

    it('should hide internal errors in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new ApplicationError('Internal error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        [ERROR_RESPONSE_KEYS.ERROR]: {
          [ERROR_RESPONSE_KEYS.MESSAGE]: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
          [ERROR_RESPONSE_KEYS.STATUS_CODE]: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        },
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should include stack trace in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new ApplicationError('Test error', HTTP_STATUS.BAD_REQUEST);
      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      const callArgs = jsonMock.mock.calls[0][0];
      expect(callArgs[ERROR_RESPONSE_KEYS.ERROR][ERROR_RESPONSE_KEYS.STACK]).toBeDefined();

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

      expect(statusMock).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(jsonMock).toHaveBeenCalledWith({
        [ERROR_RESPONSE_KEYS.ERROR]: {
          [ERROR_RESPONSE_KEYS.MESSAGE]: ERROR_MESSAGES.ROUTE_NOT_FOUND,
          [ERROR_RESPONSE_KEYS.STATUS_CODE]: HTTP_STATUS.NOT_FOUND,
        },
      });
    });
  });
});
