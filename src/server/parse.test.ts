import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import { setupParse } from './parse.js';

// Mock ParseServer
vi.mock('parse-server', () => {
  class MockParseServer {
    start = vi.fn().mockResolvedValue(undefined);
    app = express();
  }

  return {
    ParseServer: MockParseServer,
  };
});

// Mock Parse SDK
vi.mock('parse/node.js', () => ({
  default: {
    initialize: vi.fn(),
    masterKey: '',
    serverURL: '',
  },
}));

// Mock config
vi.mock('../../config.js', () => ({
  config: {
    databaseURI: 'mongodb://localhost:27017/test',
    appId: 'test-app-id',
    masterKey: 'test-master-key',
    serverURL: 'http://localhost:5000',
  },
}));

// Mock env
vi.mock('../utils/env.js', () => ({
  env: {
    APP_ID: 'test-app-id',
    MASTER_KEY: 'test-master-key',
    SERVER_URL: 'http://localhost:5000',
  },
}));

describe('Parse Server Setup', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    vi.clearAllMocks();
  });

  it('should setup Parse Server without throwing', async () => {
    await expect(setupParse(app)).resolves.not.toThrow();
  });

  it('should initialize Parse SDK', async () => {
    const Parse = (await import('parse/node.js')).default;

    await setupParse(app);

    expect(Parse.initialize).toHaveBeenCalled();
    expect(Parse.masterKey).toBe('test-master-key');
    expect(Parse.serverURL).toBe('http://localhost:5000');
  });
});
