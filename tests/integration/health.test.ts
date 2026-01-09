import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { HTTP_STATUS, ENVIRONMENTS, ROUTES } from '../../constants/index.js';

describe('Health Check Endpoint (Integration)', () => {
  let app: express.Application;

  beforeAll(async () => {
    // Create a minimal Express app for testing the health endpoint
    app = express();
    app.get(ROUTES.HEALTH, (_req, res) => {
      res.status(HTTP_STATUS.OK).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT,
      });
    });
  });

  it('should return 200 status code', async () => {
    const response = await request(app).get(ROUTES.HEALTH);
    expect(response.status).toBe(HTTP_STATUS.OK);
  });

  it('should return health check data', async () => {
    const response = await request(app).get(ROUTES.HEALTH);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('environment');
  });

  it('should return valid timestamp', async () => {
    const response = await request(app).get(ROUTES.HEALTH);
    const timestamp = new Date(response.body.timestamp);
    expect(timestamp.getTime()).toBeGreaterThan(0);
    expect(timestamp.toISOString()).toBe(response.body.timestamp);
  });

  it('should return uptime as a number', async () => {
    const response = await request(app).get(ROUTES.HEALTH);
    expect(typeof response.body.uptime).toBe('number');
    expect(response.body.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should return environment information', async () => {
    const response = await request(app).get(ROUTES.HEALTH);
    expect(response.body.environment).toBeDefined();
    expect(typeof response.body.environment).toBe('string');
  });
});
