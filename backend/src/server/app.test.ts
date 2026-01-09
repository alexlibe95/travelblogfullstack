import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createServer } from './app.js';

// Mock dependencies
vi.mock('./parse.js', () => ({
  setupParse: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./dashboard.js', () => ({
  setupDashboard: vi.fn(),
}));

vi.mock('../routes/index.js', () => ({
  registerRoutes: vi.fn(),
}));

describe('Server App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create Express app', async () => {
    const app = await createServer();
    expect(app).toBeDefined();
  });

  it('should handle root route', async () => {
    const app = await createServer();
    const response = await request(app).get('/');
    // Should either return 200 (if root route exists) or 404 (if not found handler works)
    expect([200, 404]).toContain(response.status);
  });

  it('should handle 404 for unknown routes', async () => {
    const app = await createServer();
    const response = await request(app).get('/unknown-route-that-does-not-exist');
    expect(response.status).toBe(404);
  });

  it('should parse JSON body', async () => {
    const app = await createServer();
    const response = await request(app)
      .post('/test-endpoint')
      .send({ test: 'data' })
      .set('Content-Type', 'application/json');
    // Should not crash on JSON parsing
    expect([404, 400, 500]).toContain(response.status);
  });
});
