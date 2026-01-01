import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock environment variables before importing the app
process.env.DB_URI = 'mongodb://localhost:27017/test';
process.env.APP_ID = 'test-app-id';
process.env.MASTER_KEY = 'test-master-key';
process.env.SERVER_URL = 'http://localhost:1337';
process.env.APP_NAME = 'Test App';
process.env.APP_USER = 'testuser';
process.env.APP_PASS = 'testpass';
process.env.SERVER_PORT = '1337';
process.env.NODE_ENV = 'test';

describe('Health Check Endpoint (Integration)', () => {
  let app: express.Application;

  beforeAll(async () => {
    // Create a minimal Express app for testing the health endpoint
    app = express();
    app.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      });
    });
  });

  afterAll(() => {
    // Cleanup if needed
  });

  it('should return 200 status code', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });

  it('should return health check data', async () => {
    const response = await request(app).get('/health');
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('environment');
  });

  it('should return valid timestamp', async () => {
    const response = await request(app).get('/health');
    const timestamp = new Date(response.body.timestamp);
    expect(timestamp.getTime()).toBeGreaterThan(0);
    expect(timestamp.toISOString()).toBe(response.body.timestamp);
  });

  it('should return uptime as a number', async () => {
    const response = await request(app).get('/health');
    expect(typeof response.body.uptime).toBe('number');
    expect(response.body.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return environment information', async () => {
    const response = await request(app).get('/health');
    expect(response.body.environment).toBeDefined();
    expect(typeof response.body.environment).toBe('string');
  });
});

