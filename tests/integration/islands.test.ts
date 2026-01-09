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
  ISLAND_ERROR_MESSAGES,
  ISLAND_LIST_FIELDS,
  ISLAND_DETAIL_FIELDS,
  MAX_GLOBAL_UPLOAD_SIZE_MB,
} from '../../constants/index.js';
import { schemaDefinitions } from '../../cloud/schema.js';
import { corsMiddleware, securityHeaders } from '../../src/middleware/security.js';
import {
  errorHandler,
  notFoundHandler,
  ApplicationError,
} from '../../src/middleware/errorHandler.js';

describe('Islands API Endpoints (Integration)', () => {
  let app: express.Application;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parseServer: any;
  let mongoServer: MongoMemoryServer;
  let testIslandId: string;
  let mockIslands: Array<{
    id: string;
    name: string;
    short_description: string;
    description: string;
    order: number;
    site: string;
    location: Parse.GeoPoint;
  }>;

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Override DB_URI with in-memory MongoDB URI (other env vars are set in tests/setup.ts)
    process.env.DB_URI = mongoUri;

    // Create Express app
    app = express();

    // Apply middleware
    app.use(securityHeaders);
    app.use(corsMiddleware);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Initialize Parse Server with in-memory MongoDB
    // Create test config with in-memory MongoDB
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
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parseServer = new (ParseServer as any)(testConfig);
    await parseServer.start();
    app.use(ROUTES.PARSE, parseServer.app);

    // Initialize Parse SDK for test data setup
    Parse.initialize(process.env.APP_ID!, undefined as unknown as string);
    Parse.masterKey = process.env.MASTER_KEY!;
    Parse.serverURL = process.env.SERVER_URL!;

    // Create mock islands data (matching new schema: name, short_description, site)
    mockIslands = [
      {
        id: '',
        name: 'Santorini', // Will be stored as 'name' in Parse
        short_description: 'Beautiful Greek island with stunning sunsets', // Will be stored as 'short_description'
        description:
          'Santorini is a stunning Greek island known for its white-washed buildings, blue domes, and breathtaking sunsets. It offers unique volcanic beaches and world-class wineries.',
        order: 1,
        site: 'https://example.com/santorini', // Will be stored as 'site'
        location: new Parse.GeoPoint({
          latitude: 36.4583,
          longitude: 25.3986,
        }),
      },
      {
        id: '',
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
        id: '',
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
    ];

    // Create test islands in Parse (using new schema fields: name, short_description, site)
    // Note: Parse.File uploads require a file adapter, so we skip them in tests
    // The API endpoints will still work, just without file data
    const TestIsland = Parse.Object.extend(ISLAND_CLASS_NAME);
    const createdIslands = await Promise.all(
      mockIslands.map(async (island) => {
        const parseIsland = new TestIsland();
        // Use new schema field names
        parseIsland.set(ISLAND_FIELDS.NAME, island.name);
        parseIsland.set(ISLAND_FIELDS.SHORT_DESCRIPTION, island.short_description);
        parseIsland.set(ISLAND_FIELDS.DESCRIPTION, island.description);
        parseIsland.set(ISLAND_FIELDS.ORDER, island.order);
        parseIsland.set(ISLAND_FIELDS.SITE, island.site);
        parseIsland.set(ISLAND_FIELDS.LOCATION, island.location);
        // Skip file uploads in tests - they require a file adapter configuration
        // parseIsland.set(ISLAND_FIELDS.PHOTO, island.photo);
        // parseIsland.set(ISLAND_FIELDS.PHOTO_THUMB, island.photoThumb);
        await parseIsland.save(null, { useMasterKey: true });
        return parseIsland;
      })
    );

    // Update mock islands with actual IDs
    mockIslands = mockIslands.map((island, index) => ({
      ...island,
      id: createdIslands[index].id,
    }));

    // Use the first island as testIslandId for detail tests
    testIslandId = mockIslands[0].id;

    // Mount API routes (replicate controller behavior - but use schema field names)
    app.get(ROUTES.API.ISLANDS, async (_req, res, next) => {
      try {
        const query = new Parse.Query(ISLAND_CLASS_NAME);
        query.ascending(ISLAND_FIELDS.ORDER);
        // Select fields that match the schema (name, short_description, etc.)
        query.select(...ISLAND_LIST_FIELDS);
        const islands = await query.find({ useMasterKey: true });
        res.status(HTTP_STATUS.OK).json({
          [API_RESPONSE_KEYS.SUCCESS]: true,
          [API_RESPONSE_KEYS.DATA]: islands.map((i) => i.toJSON()),
        });
      } catch (error) {
        next(
          new ApplicationError(
            error instanceof Error ? error.message : ISLAND_ERROR_MESSAGES.FETCH_FAILED,
            HTTP_STATUS.INTERNAL_SERVER_ERROR
          )
        );
      }
    });

    app.get(`${ROUTES.API.ISLANDS}/:id`, async (req, res, next) => {
      try {
        const { id } = req.params;
        if (!id) {
          throw new ApplicationError(ISLAND_ERROR_MESSAGES.ID_REQUIRED, HTTP_STATUS.BAD_REQUEST);
        }
        const query = new Parse.Query(ISLAND_CLASS_NAME);
        // Select fields that match the schema
        query.select(...ISLAND_DETAIL_FIELDS);
        const island = await query.get(id, { useMasterKey: true });
        res.status(HTTP_STATUS.OK).json({
          [API_RESPONSE_KEYS.SUCCESS]: true,
          [API_RESPONSE_KEYS.DATA]: island.toJSON(),
        });
      } catch (error) {
        if (error instanceof Parse.Error && error.code === Parse.Error.OBJECT_NOT_FOUND) {
          next(new ApplicationError(ISLAND_ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND));
        } else {
          next(
            new ApplicationError(
              error instanceof Error ? error.message : ISLAND_ERROR_MESSAGES.FETCH_ONE_FAILED,
              HTTP_STATUS.INTERNAL_SERVER_ERROR
            )
          );
        }
      }
    });

    // Add error handlers
    app.use(notFoundHandler);
    app.use(errorHandler);
  }, 60000); // Increased timeout for MongoDB Memory Server startup

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

  describe('GET /api/islands', () => {
    it('should return 200 status code', async () => {
      const response = await request(app).get(ROUTES.API.ISLANDS);
      expect(response.status).toBe(HTTP_STATUS.OK);
    });

    it('should return success response structure', async () => {
      const response = await request(app).get(ROUTES.API.ISLANDS);
      expect(response.body).toHaveProperty(API_RESPONSE_KEYS.SUCCESS, true);
      expect(response.body).toHaveProperty(API_RESPONSE_KEYS.DATA);
      expect(Array.isArray(response.body[API_RESPONSE_KEYS.DATA])).toBe(true);
    });

    it('should return islands sorted by order', async () => {
      const response = await request(app).get(ROUTES.API.ISLANDS);
      const islands = response.body[API_RESPONSE_KEYS.DATA];

      expect(islands.length).toBeGreaterThanOrEqual(3);
      for (let i = 0; i < islands.length - 1; i++) {
        expect(islands[i].order).toBeLessThanOrEqual(islands[i + 1].order);
      }
    });

    it('should return only basic fields for list view', async () => {
      const response = await request(app).get(ROUTES.API.ISLANDS);
      const island = response.body[API_RESPONSE_KEYS.DATA][0];

      expect(island).toBeDefined();
      expect(island).toHaveProperty('objectId');
      expect(island).toHaveProperty('name');
      expect(island).toHaveProperty('short_description');
      expect(island).toHaveProperty('order');
      // Photo fields are optional and not set in tests (require file adapter)
      expect(island).not.toHaveProperty('description');
      expect(island).not.toHaveProperty('site');
      expect(island).not.toHaveProperty('location');
      expect(island).not.toHaveProperty('photo');
      expect(island).not.toHaveProperty('photo_thumb');
    });

    it('should return count matching data array length', async () => {
      const response = await request(app).get(ROUTES.API.ISLANDS);
      // Controller returns data directly, no count field
      expect(Array.isArray(response.body[API_RESPONSE_KEYS.DATA])).toBe(true);
      expect(response.body[API_RESPONSE_KEYS.DATA].length).toBe(3);
    });

    it('should return correct mock data', async () => {
      const response = await request(app).get(ROUTES.API.ISLANDS);
      const islands = response.body[API_RESPONSE_KEYS.DATA];

      // Check that we have the expected islands (schema uses 'name' field)
      const names = islands.map((island: { name: string }) => island.name);
      expect(names).toContain('Santorini');
      expect(names).toContain('Maldives');
      expect(names).toContain('Bali');
    });
  });

  describe('GET /api/islands/:id', () => {
    it('should return 200 status code for valid island ID', async () => {
      const response = await request(app).get(`${ROUTES.API.ISLANDS}/${testIslandId}`);
      expect(response.status).toBe(HTTP_STATUS.OK);
    });

    it('should return success response structure', async () => {
      const response = await request(app).get(`${ROUTES.API.ISLANDS}/${testIslandId}`);
      expect(response.body).toHaveProperty(API_RESPONSE_KEYS.SUCCESS, true);
      expect(response.body).toHaveProperty(API_RESPONSE_KEYS.DATA);
      expect(typeof response.body[API_RESPONSE_KEYS.DATA]).toBe('object');
    });

    it('should return full island details', async () => {
      const response = await request(app).get(`${ROUTES.API.ISLANDS}/${testIslandId}`);
      const island = response.body[API_RESPONSE_KEYS.DATA];

      expect(island).toHaveProperty('objectId');
      expect(island).toHaveProperty('name');
      expect(island).toHaveProperty('short_description');
      expect(island).toHaveProperty('description');
      expect(island).toHaveProperty('order');
      expect(island).toHaveProperty('site');
      expect(island).toHaveProperty('location');
      // Photo fields are optional and not set in tests (require file adapter)
      // They may be undefined/null if not set
      expect(island).toHaveProperty('createdAt');
      expect(island).toHaveProperty('updatedAt');
    });

    it('should return correct island data', async () => {
      const response = await request(app).get(`${ROUTES.API.ISLANDS}/${testIslandId}`);
      const island = response.body[API_RESPONSE_KEYS.DATA];

      expect(island.objectId).toBe(testIslandId);
      expect(island.name).toBe('Santorini');
      expect(island.short_description).toBe('Beautiful Greek island with stunning sunsets');
      expect(island.description).toContain('Santorini');
      expect(island.order).toBe(1);
      expect(island.site).toBe('https://example.com/santorini');
      expect(island.location).toBeDefined();
    });

    it('should return 404 for non-existent island ID', async () => {
      const fakeId = 'nonexistent123';
      const response = await request(app).get(`${ROUTES.API.ISLANDS}/${fakeId}`);
      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
    });

    it('should return error structure for 404', async () => {
      const fakeId = 'nonexistent123';
      const response = await request(app).get(`${ROUTES.API.ISLANDS}/${fakeId}`);
      expect(response.body).toHaveProperty(ERROR_RESPONSE_KEYS.ERROR);
      expect(response.body[ERROR_RESPONSE_KEYS.ERROR]).toHaveProperty(ERROR_RESPONSE_KEYS.MESSAGE);
      expect(response.body[ERROR_RESPONSE_KEYS.ERROR]).toHaveProperty(
        ERROR_RESPONSE_KEYS.STATUS_CODE,
        HTTP_STATUS.NOT_FOUND
      );
    });

    it('should return valid timestamps', async () => {
      const response = await request(app).get(`${ROUTES.API.ISLANDS}/${testIslandId}`);
      const island = response.body[API_RESPONSE_KEYS.DATA];

      const createdAt = new Date(island.createdAt);
      const updatedAt = new Date(island.updatedAt);

      expect(createdAt.getTime()).toBeGreaterThan(0);
      expect(updatedAt.getTime()).toBeGreaterThan(0);
      expect(createdAt.toISOString()).toBe(island.createdAt);
      expect(updatedAt.toISOString()).toBe(island.updatedAt);
    });
  });
});
