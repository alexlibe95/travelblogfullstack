import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ENVIRONMENTS, ROUTES } from '../../constants/index.js';

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  // Helper function to dynamically import and test validateEnv
  async function importAndValidate() {
    // Clear the module cache
    const modulePath = new URL('./env.js', import.meta.url).pathname;
    if (require.cache) {
      delete require.cache[modulePath];
    }
    const { validateEnv } = await import('./env.js');
    return validateEnv();
  }

  it('should validate all required environment variables', async () => {
    // Set all required environment variables
    process.env.DB_URI = 'mongodb://localhost:27017/test';
    process.env.APP_ID = 'test-app-id';
    process.env.MASTER_KEY = 'test-master-key';
    process.env.SERVER_URL = 'http://localhost:5000';
    process.env.APP_NAME = 'Test App';
    process.env.APP_USER = 'testuser';
    process.env.APP_PASS = 'testpass';
    process.env.SERVER_PORT = '5000';

    await expect(importAndValidate()).resolves.toBeDefined();
  });

  it('should throw error when DB_URI is missing', async () => {
    process.env.APP_ID = 'test-app-id';
    process.env.MASTER_KEY = 'test-master-key';
    process.env.SERVER_URL = 'http://localhost:5000';
    process.env.APP_NAME = 'Test App';
    process.env.APP_USER = 'testuser';
    process.env.APP_PASS = 'testpass';
    process.env.SERVER_PORT = '5000';
    delete process.env.DB_URI;

    await expect(importAndValidate()).rejects.toThrow(
      'Missing required environment variables: DB_URI'
    );
  });

  it('should throw error when multiple variables are missing', async () => {
    process.env.APP_ID = 'test-app-id';
    process.env.MASTER_KEY = 'test-master-key';
    delete process.env.DB_URI;
    delete process.env.SERVER_URL;
    delete process.env.APP_NAME;

    await expect(importAndValidate()).rejects.toThrow(/Missing required environment variables/);
  });

  it('should return default NODE_ENV when not set', async () => {
    process.env.DB_URI = 'mongodb://localhost:27017/test';
    process.env.APP_ID = 'test-app-id';
    process.env.MASTER_KEY = 'test-master-key';
    process.env.SERVER_URL = 'http://localhost:5000';
    process.env.APP_NAME = 'Test App';
    process.env.APP_USER = 'testuser';
    process.env.APP_PASS = 'testpass';
    process.env.SERVER_PORT = '5000';
    delete process.env.NODE_ENV;

    const config = await importAndValidate();
    expect(config.NODE_ENV).toBe(ENVIRONMENTS.DEVELOPMENT);
  });

  it('should return default PARSE_MOUNT when not set', async () => {
    process.env.DB_URI = 'mongodb://localhost:27017/test';
    process.env.APP_ID = 'test-app-id';
    process.env.MASTER_KEY = 'test-master-key';
    process.env.SERVER_URL = 'http://localhost:5000';
    process.env.APP_NAME = 'Test App';
    process.env.APP_USER = 'testuser';
    process.env.APP_PASS = 'testpass';
    process.env.SERVER_PORT = '5000';
    delete process.env.PARSE_MOUNT;

    const config = await importAndValidate();
    expect(config.PARSE_MOUNT).toBe(ROUTES.PARSE);
  });

  it('should return all environment variables correctly', async () => {
    process.env.DB_URI = 'mongodb://localhost:27017/test';
    process.env.APP_ID = 'test-app-id';
    process.env.MASTER_KEY = 'test-master-key';
    process.env.SERVER_URL = 'http://localhost:5000';
    process.env.APP_NAME = 'Test App';
    process.env.APP_USER = 'testuser';
    process.env.APP_PASS = 'testpass';
    process.env.SERVER_PORT = '5000';
    process.env.NODE_ENV = ENVIRONMENTS.PRODUCTION;
    process.env.PARSE_MOUNT = '/api';

    const config = await importAndValidate();

    expect(config.DB_URI).toBe('mongodb://localhost:27017/test');
    expect(config.APP_ID).toBe('test-app-id');
    expect(config.MASTER_KEY).toBe('test-master-key');
    expect(config.SERVER_URL).toBe('http://localhost:5000');
    expect(config.APP_NAME).toBe('Test App');
    expect(config.APP_USER).toBe('testuser');
    expect(config.APP_PASS).toBe('testpass');
    expect(config.SERVER_PORT).toBe('5000');
    expect(config.NODE_ENV).toBe(ENVIRONMENTS.PRODUCTION);
    expect(config.PARSE_MOUNT).toBe('/api');
  });
});
