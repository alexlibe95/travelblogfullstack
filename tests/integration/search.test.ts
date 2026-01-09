import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { ParseServer } from 'parse-server';
import Parse from 'parse/node.js';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  HTTP_STATUS,
  ROUTES,
  ISLAND_CLASS_NAME,
  ISLAND_FIELDS,
  API_RESPONSE_KEYS,
  ERROR_RESPONSE_KEYS,
} from '../../constants/index.js';
import { schemaDefinitions } from '../../cloud/schema.js';
import { corsMiddleware, securityHeaders } from '../../src/middleware/security.js';
import { errorHandler, notFoundHandler } from '../../src/middleware/errorHandler.js';
import { searchIslands } from '../../src/controllers/search.controller.js';

describe('Search API Endpoints (Integration)', () => {
  let app: express.Application;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parseServer: any;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Set up test environment variables
    process.env.DB_URI = mongoUri;
    process.env.APP_ID = 'test-app-id';
    process.env.MASTER_KEY = 'test-master-key';
    process.env.SERVER_URL = 'http://localhost:1337';
    process.env.APP_NAME = 'Test App';
    process.env.APP_USER = 'testuser';
    process.env.APP_PASS = 'testpass';
    process.env.SERVER_PORT = '1337';
    process.env.NODE_ENV = 'test';

    // Create Express app
    app = express();

    // Apply middleware
    app.use(securityHeaders);
    app.use(corsMiddleware);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

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
      maxUploadSize: '5mb',
      // Suppress info-level logs during tests
      logLevel: 'error',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parseServer = new (ParseServer as any)(testConfig);
    await parseServer.start();
    app.use(ROUTES.PARSE, parseServer.app);

    // Initialize Parse SDK for test data setup
    Parse.initialize(process.env.APP_ID, process.env.MASTER_KEY);
    Parse.serverURL = process.env.SERVER_URL;

    // Create test islands with diverse content for searching
    const TestIsland = Parse.Object.extend(ISLAND_CLASS_NAME);
    const testIslands = [
      {
        name: 'Santorini',
        short_description: 'Beautiful Greek island with stunning sunsets',
        description:
          'Santorini is a stunning Greek island known for its white-washed buildings, blue domes, and breathtaking sunsets. It offers unique volcanic beaches and world-class wineries.',
        order: 1,
        site: 'https://example.com/santorini',
        location: new Parse.GeoPoint({
          latitude: 36.4583,
          longitude: 25.3986,
        }),
      },
      {
        name: 'Maldives',
        short_description: 'Tropical paradise with crystal clear waters',
        description:
          'The Maldives is a tropical paradise consisting of over 1,000 coral islands. It features pristine white sand beaches, crystal-clear turquoise waters, and luxurious overwater bungalows.',
        order: 2,
        site: 'https://example.com/maldives',
        location: new Parse.GeoPoint({
          latitude: 4.175,
          longitude: 73.5083,
        }),
      },
      {
        name: 'Bali',
        short_description: 'Indonesian island with rich culture and beautiful landscapes',
        description:
          'Bali is an Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs. It offers a rich cultural experience with ancient temples and traditional arts.',
        order: 3,
        site: 'https://example.com/bali',
        location: new Parse.GeoPoint({
          latitude: -8.3405,
          longitude: 115.092,
        }),
      },
      {
        name: 'Greek Islands',
        short_description: 'Collection of beautiful Mediterranean islands',
        description:
          'The Greek Islands are a collection of stunning Mediterranean destinations. Each island offers unique charm, from the white-washed buildings of Santorini to the ancient ruins of Crete.',
        order: 4,
        site: 'https://example.com/greek-islands',
        location: new Parse.GeoPoint({
          latitude: 37.0,
          longitude: 25.0,
        }),
      },
    ];

    // Create islands in Parse
    await Promise.all(
      testIslands.map(async (islandData) => {
        const parseIsland = new TestIsland();
        parseIsland.set(ISLAND_FIELDS.NAME, islandData.name);
        parseIsland.set(ISLAND_FIELDS.SHORT_DESCRIPTION, islandData.short_description);
        parseIsland.set(ISLAND_FIELDS.DESCRIPTION, islandData.description);
        parseIsland.set(ISLAND_FIELDS.ORDER, islandData.order);
        parseIsland.set(ISLAND_FIELDS.SITE, islandData.site);
        parseIsland.set(ISLAND_FIELDS.LOCATION, islandData.location);
        await parseIsland.save(null, { useMasterKey: true });
        return parseIsland;
      })
    );

    // Mount search route
    app.get(ROUTES.API.SEARCH, searchIslands);

    // Add error handlers
    app.use(notFoundHandler);
    app.use(errorHandler);
  }, 60000);

  afterAll(async () => {
    // Clean up Parse Server
    if (parseServer && typeof parseServer.handleShutdown === 'function') {
      try {
        await parseServer.handleShutdown();
      } catch {
        // Ignore shutdown errors
      }
    }
    // Stop in-memory MongoDB server
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  describe('GET /api/search', () => {
    it('should return 400 when query parameter is missing', async () => {
      const response = await request(app).get(ROUTES.API.SEARCH);
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body).toHaveProperty(ERROR_RESPONSE_KEYS.ERROR);
      expect(response.body[ERROR_RESPONSE_KEYS.ERROR]).toHaveProperty(ERROR_RESPONSE_KEYS.MESSAGE);
    });

    it('should return 400 when query parameter is empty', async () => {
      const response = await request(app).get(`${ROUTES.API.SEARCH}?q=`);
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body).toHaveProperty(ERROR_RESPONSE_KEYS.ERROR);
    });

    it('should return 400 when query parameter is only whitespace', async () => {
      const response = await request(app).get(`${ROUTES.API.SEARCH}?q=   `);
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body).toHaveProperty(ERROR_RESPONSE_KEYS.ERROR);
    });

    it('should return success response structure', async () => {
      const response = await request(app).get(`${ROUTES.API.SEARCH}?q=Santorini`);
      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toHaveProperty(API_RESPONSE_KEYS.SUCCESS, true);
      expect(response.body).toHaveProperty(API_RESPONSE_KEYS.COUNT);
      expect(response.body).toHaveProperty(API_RESPONSE_KEYS.DATA);
      expect(Array.isArray(response.body[API_RESPONSE_KEYS.DATA])).toBe(true);
    });

    it('should search by island name', async () => {
      const response = await request(app).get(`${ROUTES.API.SEARCH}?q=Santorini`);
      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body[API_RESPONSE_KEYS.COUNT]).toBeGreaterThan(0);
      const names = response.body[API_RESPONSE_KEYS.DATA].map(
        (island: { name: string }) => island.name
      );
      expect(names).toContain('Santorini');
    });

    it('should search by short_description', async () => {
      const response = await request(app).get(`${ROUTES.API.SEARCH}?q=tropical`);
      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body[API_RESPONSE_KEYS.COUNT]).toBeGreaterThan(0);
      const names = response.body[API_RESPONSE_KEYS.DATA].map(
        (island: { name: string }) => island.name
      );
      expect(names).toContain('Maldives');
    });

    it('should search by description', async () => {
      const response = await request(app).get(`${ROUTES.API.SEARCH}?q=volcanic`);
      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body[API_RESPONSE_KEYS.COUNT]).toBeGreaterThan(0);
      const names = response.body[API_RESPONSE_KEYS.DATA].map(
        (island: { name: string }) => island.name
      );
      expect(names).toContain('Bali');
    });

    it('should return results from multiple fields', async () => {
      // "Greek" appears in both "Greek Islands" name and "Santorini" description
      const response = await request(app).get(`${ROUTES.API.SEARCH}?q=Greek`);
      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body[API_RESPONSE_KEYS.COUNT]).toBeGreaterThanOrEqual(2);
      const names = response.body[API_RESPONSE_KEYS.DATA].map(
        (island: { name: string }) => island.name
      );
      expect(names).toContain('Greek Islands');
      expect(names).toContain('Santorini');
    });

    it('should return only id and name fields', async () => {
      const response = await request(app).get(`${ROUTES.API.SEARCH}?q=Santorini`);
      expect(response.status).toBe(HTTP_STATUS.OK);
      const island = response.body[API_RESPONSE_KEYS.DATA][0];
      expect(island).toHaveProperty('id');
      expect(island).toHaveProperty('name');
      expect(Object.keys(island)).toHaveLength(2);
    });

    it('should return empty results for non-matching query', async () => {
      const response = await request(app).get(`${ROUTES.API.SEARCH}?q=NonexistentIsland123`);
      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body[API_RESPONSE_KEYS.SUCCESS]).toBe(true);
      expect(response.body[API_RESPONSE_KEYS.COUNT]).toBe(0);
      expect(response.body[API_RESPONSE_KEYS.DATA]).toHaveLength(0);
      expect(response.body).toHaveProperty('message', 'No islands found');
    });

    it('should handle case-sensitive search', async () => {
      // contains() is case-sensitive, so "santorini" (lowercase) should not match "Santorini"
      const response = await request(app).get(`${ROUTES.API.SEARCH}?q=santorini`);
      expect(response.status).toBe(HTTP_STATUS.OK);
      // This test documents the current behavior - case-sensitive search
      // If case-insensitive search is needed, the controller would need to be updated
      expect(response.body[API_RESPONSE_KEYS.COUNT]).toBe(0);
    });

    it('should handle partial word matches', async () => {
      // Search is case-sensitive, so "Beautiful" (capital B) matches Santorini
      const response = await request(app).get(`${ROUTES.API.SEARCH}?q=Beautiful`);
      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body[API_RESPONSE_KEYS.COUNT]).toBeGreaterThan(0);
      const names = response.body[API_RESPONSE_KEYS.DATA].map(
        (island: { name: string }) => island.name
      );
      expect(names).toContain('Santorini');
    });

    it('should trim whitespace from search query', async () => {
      const response = await request(app).get(`${ROUTES.API.SEARCH}?q=  Santorini  `);
      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body[API_RESPONSE_KEYS.COUNT]).toBeGreaterThan(0);
      const names = response.body[API_RESPONSE_KEYS.DATA].map(
        (island: { name: string }) => island.name
      );
      expect(names).toContain('Santorini');
    });
  });
});
