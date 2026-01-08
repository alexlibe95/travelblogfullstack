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
  ISLAND_LIST_FIELDS,
  ISLAND_DETAIL_FIELDS,
  API_RESPONSE_KEYS,
  ERROR_RESPONSE_KEYS,
  ISLAND_ERROR_MESSAGES,
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
    title: string;
    shortInfo: string;
    description: string;
    order: number;
    url: string;
    photo: string;
    photoThumb: string;
  }>;

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
    process.env.NODE_ENV = 'test'; // Test environment (not in ENVIRONMENTS constant)

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
      maxUploadSize: '5mb',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parseServer = new (ParseServer as any)(testConfig);
    await parseServer.start();
    app.use(ROUTES.PARSE, parseServer.app);

    // Initialize Parse SDK for test data setup
    Parse.initialize(process.env.APP_ID, process.env.MASTER_KEY);
    Parse.serverURL = process.env.SERVER_URL;

    // Create mock islands data
    mockIslands = [
      {
        id: '',
        title: 'Santorini',
        shortInfo: 'Beautiful Greek island with stunning sunsets',
        description:
          'Santorini is a stunning Greek island known for its white-washed buildings, blue domes, and breathtaking sunsets. It offers unique volcanic beaches and world-class wineries.',
        order: 1,
        url: 'https://example.com/santorini',
        photo: 'https://example.com/santorini.jpg',
        photoThumb: 'https://example.com/santorini_thumb.jpg',
      },
      {
        id: '',
        title: 'Maldives',
        shortInfo: 'Tropical paradise with crystal clear waters',
        description:
          'The Maldives is a tropical paradise consisting of over 1,000 coral islands. It features pristine white sand beaches, crystal-clear turquoise waters, and luxurious overwater bungalows.',
        order: 2,
        url: 'https://example.com/maldives',
        photo: 'https://example.com/maldives.jpg',
        photoThumb: 'https://example.com/maldives_thumb.jpg',
      },
      {
        id: '',
        title: 'Bali',
        shortInfo: 'Indonesian island with rich culture and beautiful landscapes',
        description:
          'Bali is an Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs. It offers a rich cultural experience with ancient temples and traditional arts.',
        order: 3,
        url: 'https://example.com/bali',
        photo: 'https://example.com/bali.jpg',
        photoThumb: 'https://example.com/bali_thumb.jpg',
      },
    ];

    // Create test islands in Parse
    const TestIsland = Parse.Object.extend(ISLAND_CLASS_NAME);
    const createdIslands = await Promise.all(
      mockIslands.map(async (island) => {
        const parseIsland = new TestIsland();
        parseIsland.set(ISLAND_FIELDS.TITLE, island.title);
        parseIsland.set(ISLAND_FIELDS.SHORT_INFO, island.shortInfo);
        parseIsland.set(ISLAND_FIELDS.DESCRIPTION, island.description);
        parseIsland.set(ISLAND_FIELDS.ORDER, island.order);
        parseIsland.set(ISLAND_FIELDS.URL, island.url);
        parseIsland.set(ISLAND_FIELDS.PHOTO, island.photo);
        parseIsland.set(ISLAND_FIELDS.PHOTO_THUMB, island.photoThumb);
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

    // Mount API routes (replicate from index.ts)
    app.get(ROUTES.ISLANDS, async (_req, res, next) => {
      try {
        const query = new Parse.Query(ISLAND_CLASS_NAME);
        query.ascending(ISLAND_FIELDS.ORDER);
        query.select(...ISLAND_LIST_FIELDS);
        const islands = await query.find({ useMasterKey: true });
        const islandsData = islands.map((island) => {
          const data = island.toJSON();
          return {
            id: data[ISLAND_FIELDS.OBJECT_ID],
            title: data[ISLAND_FIELDS.TITLE],
            shortInfo: data[ISLAND_FIELDS.SHORT_INFO],
            photo: data[ISLAND_FIELDS.PHOTO],
            photoThumb: data[ISLAND_FIELDS.PHOTO_THUMB],
            order: data[ISLAND_FIELDS.ORDER],
          };
        });
        res.status(HTTP_STATUS.OK).json({
          [API_RESPONSE_KEYS.SUCCESS]: true,
          [API_RESPONSE_KEYS.COUNT]: islandsData.length,
          [API_RESPONSE_KEYS.DATA]: islandsData,
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

    app.get(`${ROUTES.ISLANDS}/:id`, async (req, res, next) => {
      try {
        const { id } = req.params;
        if (!id) {
          throw new ApplicationError(ISLAND_ERROR_MESSAGES.ID_REQUIRED, HTTP_STATUS.BAD_REQUEST);
        }
        const query = new Parse.Query(ISLAND_CLASS_NAME);
        query.select(...ISLAND_DETAIL_FIELDS);
        const island = await query.get(id, { useMasterKey: true });
        const data = island.toJSON();
        res.status(HTTP_STATUS.OK).json({
          [API_RESPONSE_KEYS.SUCCESS]: true,
          [API_RESPONSE_KEYS.DATA]: {
            id: data[ISLAND_FIELDS.OBJECT_ID],
            title: data[ISLAND_FIELDS.TITLE],
            shortInfo: data[ISLAND_FIELDS.SHORT_INFO],
            description: data[ISLAND_FIELDS.DESCRIPTION],
            order: data[ISLAND_FIELDS.ORDER],
            url: data[ISLAND_FIELDS.URL],
            photo: data[ISLAND_FIELDS.PHOTO],
            photoThumb: data[ISLAND_FIELDS.PHOTO_THUMB],
            location: data[ISLAND_FIELDS.LOCATION],
            createdAt: data[ISLAND_FIELDS.CREATED_AT],
            updatedAt: data[ISLAND_FIELDS.UPDATED_AT],
          },
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
      const response = await request(app).get(ROUTES.ISLANDS);
      expect(response.status).toBe(HTTP_STATUS.OK);
    });

    it('should return success response structure', async () => {
      const response = await request(app).get(ROUTES.ISLANDS);
      expect(response.body).toHaveProperty(API_RESPONSE_KEYS.SUCCESS, true);
      expect(response.body).toHaveProperty(API_RESPONSE_KEYS.COUNT);
      expect(response.body).toHaveProperty(API_RESPONSE_KEYS.DATA);
      expect(Array.isArray(response.body[API_RESPONSE_KEYS.DATA])).toBe(true);
    });

    it('should return islands sorted by order', async () => {
      const response = await request(app).get(ROUTES.ISLANDS);
      const islands = response.body[API_RESPONSE_KEYS.DATA];

      expect(islands.length).toBeGreaterThanOrEqual(3);
      for (let i = 0; i < islands.length - 1; i++) {
        expect(islands[i].order).toBeLessThanOrEqual(islands[i + 1].order);
      }
    });

    it('should return only basic fields for list view', async () => {
      const response = await request(app).get(ROUTES.ISLANDS);
      const island = response.body[API_RESPONSE_KEYS.DATA][0];

      expect(island).toBeDefined();
      // Should have basic fields
      expect(island).toHaveProperty('id');
      expect(island).toHaveProperty('title');
      expect(island).toHaveProperty('shortInfo');
      expect(island).toHaveProperty('photo');
      expect(island).toHaveProperty('photoThumb');
      expect(island).toHaveProperty('order');

      // Should NOT have detail fields
      expect(island).not.toHaveProperty('description');
      expect(island).not.toHaveProperty('url');
      expect(island).not.toHaveProperty('location');
      expect(island).not.toHaveProperty('createdAt');
      expect(island).not.toHaveProperty('updatedAt');
    });

    it('should return count matching data array length', async () => {
      const response = await request(app).get(ROUTES.ISLANDS);
      expect(response.body[API_RESPONSE_KEYS.COUNT]).toBe(
        response.body[API_RESPONSE_KEYS.DATA].length
      );
      expect(response.body[API_RESPONSE_KEYS.COUNT]).toBe(3);
    });

    it('should return correct mock data', async () => {
      const response = await request(app).get(ROUTES.ISLANDS);
      const islands = response.body[API_RESPONSE_KEYS.DATA];

      // Check that we have the expected islands
      const titles = islands.map((island: { title: string }) => island.title);
      expect(titles).toContain('Santorini');
      expect(titles).toContain('Maldives');
      expect(titles).toContain('Bali');
    });
  });

  describe('GET /api/islands/:id', () => {
    it('should return 200 status code for valid island ID', async () => {
      const response = await request(app).get(`${ROUTES.ISLANDS}/${testIslandId}`);
      expect(response.status).toBe(HTTP_STATUS.OK);
    });

    it('should return success response structure', async () => {
      const response = await request(app).get(`${ROUTES.ISLANDS}/${testIslandId}`);
      expect(response.body).toHaveProperty(API_RESPONSE_KEYS.SUCCESS, true);
      expect(response.body).toHaveProperty(API_RESPONSE_KEYS.DATA);
      expect(typeof response.body[API_RESPONSE_KEYS.DATA]).toBe('object');
    });

    it('should return full island details', async () => {
      const response = await request(app).get(`${ROUTES.ISLANDS}/${testIslandId}`);
      const island = response.body[API_RESPONSE_KEYS.DATA];

      // Should have all detail fields
      expect(island).toHaveProperty('id');
      expect(island).toHaveProperty('title');
      expect(island).toHaveProperty('shortInfo');
      expect(island).toHaveProperty('description');
      expect(island).toHaveProperty('order');
      expect(island).toHaveProperty('url');
      expect(island).toHaveProperty('photo');
      expect(island).toHaveProperty('photoThumb');
      // location is optional and may not be present if not set
      expect(island).toHaveProperty('createdAt');
      expect(island).toHaveProperty('updatedAt');
    });

    it('should return correct island data', async () => {
      const response = await request(app).get(`${ROUTES.ISLANDS}/${testIslandId}`);
      const island = response.body[API_RESPONSE_KEYS.DATA];

      expect(island.id).toBe(testIslandId);
      expect(island.title).toBe('Santorini');
      expect(island.shortInfo).toBe('Beautiful Greek island with stunning sunsets');
      expect(island.description).toContain('Santorini');
      expect(island.order).toBe(1);
      expect(island.url).toBe('https://example.com/santorini');
    });

    it('should return 404 for non-existent island ID', async () => {
      const fakeId = 'nonexistent123';
      const response = await request(app).get(`${ROUTES.ISLANDS}/${fakeId}`);
      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
    });

    it('should return error structure for 404', async () => {
      const fakeId = 'nonexistent123';
      const response = await request(app).get(`${ROUTES.ISLANDS}/${fakeId}`);
      expect(response.body).toHaveProperty(ERROR_RESPONSE_KEYS.ERROR);
      expect(response.body[ERROR_RESPONSE_KEYS.ERROR]).toHaveProperty(ERROR_RESPONSE_KEYS.MESSAGE);
      expect(response.body[ERROR_RESPONSE_KEYS.ERROR]).toHaveProperty(
        ERROR_RESPONSE_KEYS.STATUS_CODE,
        HTTP_STATUS.NOT_FOUND
      );
    });

    it('should return valid timestamps', async () => {
      const response = await request(app).get(`${ROUTES.ISLANDS}/${testIslandId}`);
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
