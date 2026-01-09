import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import Parse from 'parse/node.js';
import { requireAdmin } from './auth.middleware.js';
import { HTTP_STATUS, SECURITY_HEADERS } from '../../constants/index.js';
import { ApplicationError } from './errorHandler.js';

// Create shared mock functions that can be configured per test
const mockQueryMethods = {
  equalTo: vi.fn().mockReturnThis(),
  first: vi.fn(),
};

// Mock Parse module
vi.mock('parse/node.js', () => {
  // Create a mock Query class constructor that uses shared mock methods
  class MockQuery {
    equalTo = mockQueryMethods.equalTo;
    first = mockQueryMethods.first;
  }

  return {
    default: {
      User: {
        enableUnsafeCurrentUser: vi.fn(),
        become: vi.fn(),
      },
      Role: {},
      Query: MockQuery,
    },
  };
});

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    mockNext = vi.fn();
    vi.clearAllMocks();
    // Reset mock query methods
    mockQueryMethods.equalTo.mockReturnThis();
    mockQueryMethods.first.mockReset();
  });

  describe('requireAdmin', () => {
    it('should throw error when session token is missing', async () => {
      mockRequest.headers = {};

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await requireAdmin(mockRequest as Request, mockResponse as Response, mockNext as any);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0] as ApplicationError;
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
    });

    it('should throw error when session token is invalid', async () => {
      mockRequest.headers = {
        [SECURITY_HEADERS.X_PARSE_SESSION_TOKEN]: 'invalid-token',
      };

      // Mock Parse.User.become to throw an error
      (Parse.User.become as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Invalid session token')
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await requireAdmin(mockRequest as Request, mockResponse as Response, mockNext as any);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0] as ApplicationError;
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
    });

    it('should throw error when user is not admin', async () => {
      const mockUser = {
        id: 'user123',
        getUsername: vi.fn().mockReturnValue('regular-user'),
      };

      mockRequest.headers = {
        [SECURITY_HEADERS.X_PARSE_SESSION_TOKEN]: 'valid-token',
      };

      // Mock Parse.User.become to return a user
      (Parse.User.become as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

      // Mock role query to return null (not admin)
      mockQueryMethods.first.mockResolvedValue(null);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await requireAdmin(mockRequest as Request, mockResponse as Response, mockNext as any);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0] as ApplicationError;
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
    });

    it('should call next() when user is admin', async () => {
      const mockUser = {
        id: 'user123',
        getUsername: vi.fn().mockReturnValue('admin'),
      };

      const mockRole = {
        id: 'role123',
        get: vi.fn().mockReturnValue('administrator'),
      };

      mockRequest.headers = {
        [SECURITY_HEADERS.X_PARSE_SESSION_TOKEN]: 'valid-admin-token',
      };

      // Mock Parse.User.become to return a user
      (Parse.User.become as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

      // Mock role query to return admin role
      mockQueryMethods.first.mockResolvedValue(mockRole);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await requireAdmin(mockRequest as Request, mockResponse as Response, mockNext as any);

      expect(Parse.User.enableUnsafeCurrentUser).toHaveBeenCalled();
      expect(Parse.User.become).toHaveBeenCalledWith('valid-admin-token');
      expect(mockNext).toHaveBeenCalledWith();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((mockRequest as any).parseUser).toBeDefined();
    });

    it('should set req.parseUser when admin authentication succeeds', async () => {
      const mockUser = {
        id: 'user123',
        getUsername: vi.fn().mockReturnValue('admin'),
      };

      const mockRole = {
        id: 'role123',
        get: vi.fn().mockReturnValue('administrator'),
      };

      mockRequest.headers = {
        [SECURITY_HEADERS.X_PARSE_SESSION_TOKEN]: 'valid-admin-token',
      };

      (Parse.User.become as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

      mockQueryMethods.first.mockResolvedValue(mockRole);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await requireAdmin(mockRequest as Request, mockResponse as Response, mockNext as any);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((mockRequest as any).parseUser).toBe(mockUser);
    });
  });
});
