/**
 * Vitest setup file - runs before all tests
 * Sets up required environment variables for testing
 * This file is configured in vitest.config.ts as a setupFiles entry
 */

// Set up test environment variables with defaults
// Uses || operator to allow overriding via environment variables
process.env.DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/test';
process.env.APP_ID = process.env.APP_ID || 'test-app-id';
process.env.MASTER_KEY = process.env.MASTER_KEY || 'test-master-key';
process.env.SERVER_URL = process.env.SERVER_URL || 'http://localhost:1337';
process.env.APP_NAME = process.env.APP_NAME || 'Test App';
process.env.APP_USER = process.env.APP_USER || 'testuser';
process.env.APP_PASS = process.env.APP_PASS || 'testpass';
process.env.SERVER_PORT = process.env.SERVER_PORT || '1337';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
