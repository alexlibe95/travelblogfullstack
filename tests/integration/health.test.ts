import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import ParseServer from 'parse-server';
import Parse from 'parse/node.js';
import { HTTP_STATUS, ROUTES, MAX_GLOBAL_UPLOAD_SIZE_MB } from '../../constants/index.js';
import { schemaDefinitions } from '../../cloud/schema.js';
import { healthRoutes } from '../../src/routes/health.routes.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

describe('Health Check Endpoint (Integration)', () => {
  let app: express.Application;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parseServer: any;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Override DB_URI with in-memory MongoDB URI
    process.env.DB_URI = mongoUri;

    // Create Express app
    app = express();
    app.use(express.json());

    // Initialize Parse Server with in-memory MongoDB
    const testConfig = {
      databaseURI: mongoUri,
      cloud: () => import('../../cloud/main.js'),
      appId: process.env.APP_ID,
      masterKey: process.env.MASTER_KEY,
      serverURL: process.env.SERVER_URL,
      schema: {
        definitions: schemaDefinitions,
        lockSchemas: true,
        strict: true,
        recreateModifiedFields: false,
        deleteExtraFields: false,
      },
      maxUploadSize: MAX_GLOBAL_UPLOAD_SIZE_MB,
      logLevel: 'error', // Suppress info logs in tests
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parseServer = new (ParseServer as any)(testConfig);
    await parseServer.start();
    app.use(ROUTES.PARSE, parseServer.app);

    // Initialize Parse SDK
    Parse.initialize(process.env.APP_ID!, undefined as unknown as string);
    Parse.masterKey = process.env.MASTER_KEY!;
    Parse.serverURL = process.env.SERVER_URL!;

    // Register health routes
    app.use(healthRoutes);
    app.use(errorHandler);
  });

  afterAll(async () => {
    try {
      if (parseServer && typeof parseServer.handleShutdown === 'function') {
        await parseServer.handleShutdown();
      }
    } catch {
      // Ignore shutdown errors
    }
    await mongoServer.stop();
  });

  it('should return 200 status code when healthy', async () => {
    const response = await request(app).get(ROUTES.HEALTH);
    expect(response.status).toBe(HTTP_STATUS.OK);
  });

  it('should return health check data with all required fields', async () => {
    const response = await request(app).get(ROUTES.HEALTH);
    expect(response.body).toHaveProperty('status');
    expect(['ok', 'degraded', 'error']).toContain(response.body.status);
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('environment');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('checks');
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

  it('should return version information', async () => {
    const response = await request(app).get(ROUTES.HEALTH);
    expect(response.body.version).toBeDefined();
    expect(typeof response.body.version).toBe('string');
  });

  it('should include database health check', async () => {
    const response = await request(app).get(ROUTES.HEALTH);
    expect(response.body.checks).toHaveProperty('database');
    expect(response.body.checks.database).toHaveProperty('status');
    expect(['ok', 'error']).toContain(response.body.checks.database.status);
    if (response.body.checks.database.status === 'ok') {
      expect(response.body.checks.database).toHaveProperty('responseTime');
      expect(typeof response.body.checks.database.responseTime).toBe('number');
      expect(response.body.checks.database.responseTime).toBeGreaterThanOrEqual(0);
    }
  });

  it('should include Parse Server health check', async () => {
    const response = await request(app).get(ROUTES.HEALTH);
    expect(response.body.checks).toHaveProperty('parseServer');
    expect(response.body.checks.parseServer).toHaveProperty('status');
    expect(['ok', 'error']).toContain(response.body.checks.parseServer.status);
    if (response.body.checks.parseServer.status === 'ok') {
      expect(response.body.checks.parseServer).toHaveProperty('responseTime');
      expect(typeof response.body.checks.parseServer.responseTime).toBe('number');
      expect(response.body.checks.parseServer.responseTime).toBeGreaterThanOrEqual(0);
    }
  });

  it('should return status "ok" when all checks pass', async () => {
    const response = await request(app).get(ROUTES.HEALTH);
    if (response.body.checks.database.status === 'ok' && response.body.checks.parseServer.status === 'ok') {
      expect(response.body.status).toBe('ok');
    }
  });
});
