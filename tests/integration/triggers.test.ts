import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { ParseServer } from 'parse-server';
import Parse from 'parse/node.js';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  ISLAND_CLASS_NAME,
  ISLAND_FIELDS,
  MAX_GLOBAL_UPLOAD_SIZE_MB,
  ROUTES,
} from '../../constants/index.js';
import { schemaDefinitions } from '../../cloud/schema.js';

describe('Island Triggers (Integration)', () => {
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
    process.env.THUMB_WIDTH = '300';
    process.env.THUMB_HEIGHT = '300';

    // Create Express app
    app = express();
    app.use(express.json());

    // Initialize Parse Server with triggers
    const testConfig = {
      databaseURI: mongoUri,
      cloud: () => import('../../cloud/main.js'),
      appId: process.env.APP_ID!,
      masterKey: process.env.MASTER_KEY!,
      serverURL: process.env.SERVER_URL!,
      schema: {
        definitions: schemaDefinitions,
        lockSchemas: true,
        strict: true,
        recreateModifiedFields: false,
        deleteExtraFields: false,
      },
      maxUploadSize: MAX_GLOBAL_UPLOAD_SIZE_MB
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parseServer = new (ParseServer as any)(testConfig);
    await parseServer.start();
    app.use(ROUTES.PARSE, parseServer.app);

    // Initialize Parse SDK for test data setup
    Parse.initialize(process.env.APP_ID!, undefined as unknown as string);
    Parse.masterKey = process.env.MASTER_KEY!;
    Parse.serverURL = process.env.SERVER_URL!;
  });

  afterAll(async () => {
    // Shutdown Parse Server
    if (parseServer) {
      try {
        if (typeof parseServer.handleShutdown === 'function') {
          await parseServer.handleShutdown();
        }
      } catch {
        // Ignore shutdown errors
      }
    }

    // Stop MongoDB
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  describe('beforeSave trigger', () => {
    it('should allow saving island without photo', async () => {
      const Island = Parse.Object.extend(ISLAND_CLASS_NAME);
      const island = new Island();
      island.set(ISLAND_FIELDS.NAME, 'Test Island');
      island.set(ISLAND_FIELDS.SHORT_DESCRIPTION, 'Test description');
      island.set(ISLAND_FIELDS.DESCRIPTION, 'Full test description');
      island.set(ISLAND_FIELDS.ORDER, 1);

      await expect(island.save(null, { useMasterKey: true })).resolves.toBeDefined();
    });

    it('should not validate photo if photo field is not dirty', async () => {
      const Island = Parse.Object.extend(ISLAND_CLASS_NAME);
      const island = new Island();
      island.set(ISLAND_FIELDS.NAME, 'Test Island');
      island.set(ISLAND_FIELDS.SHORT_DESCRIPTION, 'Test description');
      island.set(ISLAND_FIELDS.DESCRIPTION, 'Full test description');
      island.set(ISLAND_FIELDS.ORDER, 1);

      await island.save(null, { useMasterKey: true });

      // Update a different field (not photo) - trigger should skip photo validation
      island.set(ISLAND_FIELDS.NAME, 'Updated Name');
      await expect(island.save(null, { useMasterKey: true })).resolves.toBeDefined();
    });

    it('should skip validation if photo is null', async () => {
      const Island = Parse.Object.extend(ISLAND_CLASS_NAME);
      const island = new Island();
      island.set(ISLAND_FIELDS.NAME, 'Test Island');
      island.set(ISLAND_FIELDS.SHORT_DESCRIPTION, 'Test description');
      island.set(ISLAND_FIELDS.DESCRIPTION, 'Full test description');
      island.set(ISLAND_FIELDS.ORDER, 1);
      island.set(ISLAND_FIELDS.PHOTO, null);

      // Should not throw even though photo is null
      await expect(island.save(null, { useMasterKey: true })).resolves.toBeDefined();
    });
  });

  describe('afterSave trigger', () => {
    it('should skip thumbnail generation if original is missing', async () => {
      const Island = Parse.Object.extend(ISLAND_CLASS_NAME);
      const island = new Island();
      island.set(ISLAND_FIELDS.NAME, 'Test Island');
      island.set(ISLAND_FIELDS.SHORT_DESCRIPTION, 'Test description');
      island.set(ISLAND_FIELDS.DESCRIPTION, 'Full test description');
      island.set(ISLAND_FIELDS.ORDER, 1);

      // First save (no original, so trigger should skip)
      await island.save(null, { useMasterKey: true });

      // Verify island was saved
      expect(island.id).toBeDefined();
    });

    it('should skip thumbnail generation if photo has not changed', async () => {
      const Island = Parse.Object.extend(ISLAND_CLASS_NAME);
      const island = new Island();
      island.set(ISLAND_FIELDS.NAME, 'Test Island');
      island.set(ISLAND_FIELDS.SHORT_DESCRIPTION, 'Test description');
      island.set(ISLAND_FIELDS.DESCRIPTION, 'Full test description');
      island.set(ISLAND_FIELDS.ORDER, 1);

      // First save
      await island.save(null, { useMasterKey: true });

      // Update without changing photo (should skip thumbnail generation)
      island.set(ISLAND_FIELDS.NAME, 'Updated Name');
      await island.save(null, { useMasterKey: true });

      // Verify island was updated
      expect(island.get(ISLAND_FIELDS.NAME)).toBe('Updated Name');
    });

    it('should skip thumbnail generation if newPhoto is missing', async () => {
      const Island = Parse.Object.extend(ISLAND_CLASS_NAME);
      const island = new Island();
      island.set(ISLAND_FIELDS.NAME, 'Test Island');
      island.set(ISLAND_FIELDS.SHORT_DESCRIPTION, 'Test description');
      island.set(ISLAND_FIELDS.DESCRIPTION, 'Full test description');
      island.set(ISLAND_FIELDS.ORDER, 1);

      // First save
      await island.save(null, { useMasterKey: true });

      // Update without photo (should skip thumbnail generation)
      island.set(ISLAND_FIELDS.NAME, 'Updated Name');
      island.unset(ISLAND_FIELDS.PHOTO);
      await island.save(null, { useMasterKey: true });

      // Verify island was updated
      expect(island.get(ISLAND_FIELDS.NAME)).toBe('Updated Name');
    });
  });
});
