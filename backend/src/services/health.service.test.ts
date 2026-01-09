import { describe, it, expect, beforeEach, vi } from 'vitest';
import { performHealthCheck } from './health.service.js';
import Parse from 'parse/node.js';
import { logger } from '../utils/logger.js';

// Create shared mock functions that can be configured per test
const mockQueryMethods = {
  limit: vi.fn().mockReturnThis(),
  find: vi.fn(),
};

// Mock Parse module
vi.mock('parse/node.js', () => {
  // Create a mock Query class constructor that uses shared mock methods
  class MockQuery {
    limit = mockQueryMethods.limit;
    find = mockQueryMethods.find;
  }

  return {
    default: {
      Query: MockQuery,
      applicationId: 'test-app-id',
      serverURL: 'http://localhost:5000',
    },
  };
});

// Mock logger
vi.mock('../utils/logger.js', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('Health Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Parse SDK mocks
    (Parse as any).applicationId = 'test-app-id';
    (Parse as any).serverURL = 'http://localhost:5000';
    // Reset mock query methods
    mockQueryMethods.limit.mockReturnThis();
    mockQueryMethods.find.mockReset();
  });

  describe('performHealthCheck', () => {
    it('should return ok status when all checks pass', async () => {
      // Mock successful queries
      mockQueryMethods.find.mockResolvedValue([]);

      const result = await performHealthCheck('development', '1.0.0');

      expect(result.status).toBe('ok');
      expect(result.environment).toBe('development');
      expect(result.version).toBe('1.0.0');
      expect(result.checks.database.status).toBe('ok');
      expect(result.checks.parseServer.status).toBe('ok');
      expect(result.checks.database.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.checks.parseServer.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(mockQueryMethods.limit).toHaveBeenCalledWith(1);
    });

    it('should return error status when database check fails', async () => {
      // Mock database query failure
      const dbError = new Error('Database connection failed');
      mockQueryMethods.find.mockRejectedValue(dbError);

      const result = await performHealthCheck('development', '1.0.0');

      expect(result.status).toBe('error');
      expect(result.checks.database.status).toBe('error');
      expect(result.checks.database.message).toBe('Database connection failed');
      expect(result.checks.database.responseTime).toBeGreaterThanOrEqual(0);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should return error status when Parse Server check fails', async () => {
      // Mock Parse Server query failure - first call succeeds (database), second fails (Parse Server)
      const parseError = new Error('Parse Server not responding');
      mockQueryMethods.find
        .mockResolvedValueOnce([]) // Database check succeeds
        .mockRejectedValueOnce(parseError); // Parse Server check fails

      const result = await performHealthCheck('development', '1.0.0');

      expect(result.status).toBe('error');
      expect(result.checks.database.status).toBe('ok');
      expect(result.checks.parseServer.status).toBe('error');
      expect(result.checks.parseServer.message).toBe('Parse Server not responding');
      expect(result.checks.parseServer.responseTime).toBeGreaterThanOrEqual(0);
      expect(logger.error).toHaveBeenCalled();
    });

    it('should return error status when Parse Server is not initialized', async () => {
      // Remove Parse Server initialization
      (Parse as any).applicationId = undefined;
      (Parse as any).serverURL = undefined;

      const result = await performHealthCheck('development', '1.0.0');

      expect(result.status).toBe('error');
      expect(result.checks.parseServer.status).toBe('error');
      expect(result.checks.parseServer.message).toBe('Parse Server not initialized');
      expect(result.checks.parseServer.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should return error status when both checks fail', async () => {
      // Mock both queries failing
      const error = new Error('Connection failed');
      mockQueryMethods.find.mockRejectedValue(error);

      const result = await performHealthCheck('production', '2.0.0');

      expect(result.status).toBe('error');
      expect(result.checks.database.status).toBe('error');
      expect(result.checks.parseServer.status).toBe('error');
      expect(result.environment).toBe('production');
      expect(result.version).toBe('2.0.0');
    });

    it('should handle non-Error exceptions in database check', async () => {
      // Mock database query with non-Error exception
      mockQueryMethods.find.mockRejectedValue('String error');

      const result = await performHealthCheck('development', '1.0.0');

      expect(result.checks.database.status).toBe('error');
      expect(result.checks.database.message).toBe('Database connection failed');
    });

    it('should handle non-Error exceptions in Parse Server check', async () => {
      // Mock Parse Server query with non-Error exception
      mockQueryMethods.find
        .mockResolvedValueOnce([]) // Database check succeeds
        .mockRejectedValueOnce('String error'); // Parse Server check fails

      const result = await performHealthCheck('development', '1.0.0');

      expect(result.checks.parseServer.status).toBe('error');
      expect(result.checks.parseServer.message).toBe('Parse Server not responding');
    });

    it('should include response times for successful checks', async () => {
      // Mock successful queries with delay simulation
      mockQueryMethods.find.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 10))
      );

      const result = await performHealthCheck('development', '1.0.0');

      expect(result.checks.database.responseTime).toBeGreaterThanOrEqual(10);
      expect(result.checks.parseServer.responseTime).toBeGreaterThanOrEqual(10);
    });

    it('should include response times for failed checks', async () => {
      // Mock failed queries with delay simulation
      const error = new Error('Connection timeout');
      mockQueryMethods.find.mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(error), 10))
      );

      const result = await performHealthCheck('development', '1.0.0');

      expect(result.checks.database.responseTime).toBeGreaterThanOrEqual(10);
      expect(result.checks.parseServer.responseTime).toBeGreaterThanOrEqual(10);
    });

    it('should run database and Parse Server checks in parallel', async () => {
      // Track call count
      let callCount = 0;
      mockQueryMethods.find.mockImplementation(async () => {
        callCount++;
        return [];
      });

      await performHealthCheck('development', '1.0.0');

      // Both queries should be called (order may vary due to parallel execution)
      expect(callCount).toBe(2);
      expect(mockQueryMethods.find).toHaveBeenCalledTimes(2);
    });

    it('should return valid ISO timestamp', async () => {
      mockQueryMethods.find.mockResolvedValue([]);

      const result = await performHealthCheck('development', '1.0.0');
      const timestamp = new Date(result.timestamp);

      expect(timestamp.getTime()).toBeGreaterThan(0);
      expect(timestamp.toISOString()).toBe(result.timestamp);
    });
  });
});
