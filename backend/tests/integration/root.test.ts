import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { ROUTES } from '../../constants/index.js';
import { rootRoutes } from '../../src/routes/root.routes.js';

describe('Root Endpoint (Integration)', () => {
  let app: express.Application;

  beforeAll(async () => {
    // Create Express app
    app = express();
    app.use(express.json());

    // Set up root route
    app.use(rootRoutes);
  });

  it('should return 200 status code', async () => {
    const response = await request(app).get(ROUTES.ROOT);
    expect(response.status).toBe(200);
  });

  it('should return welcome message', async () => {
    const response = await request(app).get(ROUTES.ROOT);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Parse Server is running');
  });

  it('should return endpoints object', async () => {
    const response = await request(app).get(ROUTES.ROOT);
    expect(response.body).toHaveProperty('endpoints');
    expect(typeof response.body.endpoints).toBe('object');
  });

  it('should include parse endpoint', async () => {
    const response = await request(app).get(ROUTES.ROOT);
    expect(response.body.endpoints).toHaveProperty('parse', ROUTES.PARSE);
  });

  it('should include dashboard endpoint', async () => {
    const response = await request(app).get(ROUTES.ROOT);
    expect(response.body.endpoints).toHaveProperty('dashboard', ROUTES.DASHBOARD);
  });

  it('should include health endpoint', async () => {
    const response = await request(app).get(ROUTES.ROOT);
    expect(response.body.endpoints).toHaveProperty('health', ROUTES.HEALTH);
  });

  it('should include api endpoints object', async () => {
    const response = await request(app).get(ROUTES.ROOT);
    expect(response.body.endpoints).toHaveProperty('api');
    expect(typeof response.body.endpoints.api).toBe('object');
  });

  it('should include islands API endpoint', async () => {
    const response = await request(app).get(ROUTES.ROOT);
    expect(response.body.endpoints.api).toHaveProperty('islands', ROUTES.API.ISLANDS);
  });

  it('should include search API endpoint', async () => {
    const response = await request(app).get(ROUTES.ROOT);
    expect(response.body.endpoints.api).toHaveProperty('search', ROUTES.API.SEARCH);
  });

  it('should include auth endpoints object', async () => {
    const response = await request(app).get(ROUTES.ROOT);
    expect(response.body.endpoints.api).toHaveProperty('auth');
    expect(typeof response.body.endpoints.api.auth).toBe('object');
  });

  it('should include login endpoint', async () => {
    const response = await request(app).get(ROUTES.ROOT);
    expect(response.body.endpoints.api.auth).toHaveProperty('login', ROUTES.API.AUTH.LOGIN);
  });

  it('should include logout endpoint', async () => {
    const response = await request(app).get(ROUTES.ROOT);
    expect(response.body.endpoints.api.auth).toHaveProperty('logout', ROUTES.API.AUTH.LOGOUT);
  });

  it('should return JSON content type', async () => {
    const response = await request(app).get(ROUTES.ROOT);
    expect(response.headers['content-type']).toMatch(/json/);
  });
});
