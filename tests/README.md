# Testing Guide

This project uses [Vitest](https://vitest.dev/) for testing, a fast Vite-native unit test framework that works seamlessly with TypeScript and ES modules.

## Running Tests

### Run all tests in watch mode

```bash
npm test
```

### Run tests once (CI mode)

```bash
npm run test:run
```

### Run tests with UI

```bash
npm run test:ui
```

### Run tests with coverage

```bash
npm run test:coverage
```

### Open coverage report

```bash
npm run test:coverage:open
```

Opens the HTML coverage report in your browser (macOS/Linux). On Windows, manually open `coverage/index.html`.

### Run tests with coverage in watch mode

```bash
npm run test:coverage:watch
```

## Test Structure

```
tests/
├── integration/              # Integration tests
│   ├── auth.test.ts        # Authentication endpoints
│   ├── islands.test.ts     # Island CRUD endpoints
│   ├── search.test.ts      # Search functionality
│   ├── health.test.ts      # Health check endpoint
│   ├── root.test.ts        # Root endpoint
│   └── triggers.test.ts    # Parse Cloud triggers
├── setup.ts                # Global test setup (env variables)
└── README.md               # This file

src/
├── controllers/            # (No unit tests - tested via integration)
├── middleware/
│   ├── auth.middleware.test.ts      # Auth middleware tests
│   ├── errorHandler.test.ts         # Error handler tests
│   ├── security.test.ts             # Security middleware tests
│   └── upload.middleware.test.ts    # Upload middleware tests
├── routes/                # (No unit tests - tested via integration)
├── server/
│   ├── app.test.ts        # Server setup tests
│   ├── dashboard.test.ts   # Dashboard setup tests
│   └── parse.test.ts      # Parse Server setup tests
└── utils/
    └── env.test.ts        # Environment validation tests

cloud/
└── utils/
    └── image.test.ts      # Image processing utilities tests
```

## Test Coverage

**Current Coverage**: ~91% overall

The project includes comprehensive tests for:
- ✅ All middleware (error handling, security, auth, upload)
- ✅ Environment validation
- ✅ All API endpoints (auth, islands, search, health, root)
- ✅ Error handling scenarios
- ✅ Server setup functions
- ✅ Image processing utilities
- ✅ Parse Cloud triggers (beforeSave/afterSave)

### Coverage Reports

Coverage reports are generated in the `coverage/` directory:

- `coverage/index.html` - Interactive HTML report (open in browser)
- `coverage/coverage-final.json` - JSON report (for CI/CD)
- Console output - Text summary

## Writing Tests

### Unit Tests

Unit tests are co-located with their source files using the `.test.ts` extension.

**Example:**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { myFunction } from './myModule.js';

describe('myFunction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something', () => {
    const result = myFunction();
    expect(result).toBe(expected);
  });
});
```

### Integration Tests

Integration tests are located in the `tests/integration/` directory and test multiple components working together, including Parse Server, MongoDB, and Express routes.

**Example:**

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { ParseServer } from 'parse-server';
import Parse from 'parse/node.js';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { HTTP_STATUS, ROUTES } from '../../constants/index.js';

describe('API Endpoint (Integration)', () => {
  let app: express.Application;
  let parseServer: any;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.DB_URI = mongoUri;

    // Setup Express app
    app = express();
    app.use(express.json());

    // Setup Parse Server
    const testConfig = {
      databaseURI: mongoUri,
      cloud: () => import('../../cloud/main.js'),
      appId: process.env.APP_ID!,
      masterKey: process.env.MASTER_KEY!,
      serverURL: process.env.SERVER_URL!,
      // ... other config
    };
    parseServer = new (ParseServer as any)(testConfig);
    await parseServer.start();
    app.use(ROUTES.PARSE, parseServer.app);

    // Initialize Parse SDK
    Parse.initialize(process.env.APP_ID!, undefined as unknown as string);
    Parse.masterKey = process.env.MASTER_KEY!;
    Parse.serverURL = process.env.SERVER_URL!;
  });

  afterAll(async () => {
    // Cleanup
    if (parseServer?.handleShutdown) {
      await parseServer.handleShutdown();
    }
    await mongoServer.stop();
  });

  it('should return 200', async () => {
    const response = await request(app).get('/endpoint');
    expect(response.status).toBe(HTTP_STATUS.OK);
  });
});
```

## Environment Variables in Tests

Test environment variables are set up globally in `tests/setup.ts`, which runs before all tests. This file sets default values for:

- `DB_URI` - MongoDB connection string (overridden in integration tests with in-memory MongoDB)
- `APP_ID` - Parse application ID
- `MASTER_KEY` - Parse master key
- `SERVER_URL` - Server URL
- `APP_NAME`, `APP_USER`, `APP_PASS` - Dashboard credentials
- `SERVER_PORT` - Server port
- `NODE_ENV` - Environment (set to 'test')

**Note**: Integration tests override `DB_URI` with an in-memory MongoDB URI for isolation.

## Common Patterns

### Testing Async Functions

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Testing Error Cases

```typescript
it('should throw error on invalid input', async () => {
  await expect(functionThatThrows()).rejects.toThrow('Error message');
});
```

### Mocking Modules

```typescript
import { vi } from 'vitest';

vi.mock('./module.js', () => ({
  mockedFunction: vi.fn().mockResolvedValue('value'),
}));
```

### Testing Express Middleware

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { myMiddleware } from './middleware.js';

describe('myMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
  });

  it('should call next', () => {
    myMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
```

### Testing Parse Server Integration

```typescript
import { ParseServer } from 'parse-server';
import Parse from 'parse/node.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Use in-memory MongoDB for isolation
const mongoServer = await MongoMemoryServer.create();
const mongoUri = mongoServer.getUri();

// Initialize Parse Server
const parseServer = new ParseServer({
  databaseURI: mongoUri,
  appId: 'test-app-id',
  masterKey: 'test-master-key',
  serverURL: 'http://localhost:5000',
  // ... other config
});
await parseServer.start();

// Initialize Parse SDK
Parse.initialize('test-app-id', undefined as unknown as string);
Parse.masterKey = 'test-master-key';
Parse.serverURL = 'http://localhost:5000';
```

## Best Practices

1. **Test Naming**: Use descriptive test names that explain what is being tested
   - ✅ `it('should return 401 when session token is missing')`
   - ❌ `it('should work')`

2. **AAA Pattern**: Arrange, Act, Assert - structure your tests clearly
   ```typescript
   it('should do something', () => {
     // Arrange
     const input = 'test';
     
     // Act
     const result = functionUnderTest(input);
     
     // Assert
     expect(result).toBe('expected');
   });
   ```

3. **Isolation**: Each test should be independent and not rely on other tests
   - Use `beforeEach`/`afterEach` to reset state
   - Use `beforeAll`/`afterAll` for expensive setup/teardown

4. **Mocking**: Mock external dependencies (databases, APIs, etc.)
   - Use `mongodb-memory-server` for database tests
   - Mock Parse Server when testing middleware/utilities

5. **Edge Cases**: Test both happy paths and error cases
   - Valid inputs
   - Invalid inputs
   - Missing inputs
   - Error conditions

6. **Cleanup**: Clean up after tests
   - Reset mocks in `beforeEach`
   - Stop servers in `afterAll`
   - Clean up test data

7. **Constants**: Use constants from `constants/` instead of magic numbers/strings
   ```typescript
   import { HTTP_STATUS, ROUTES } from '../../constants/index.js';
   expect(response.status).toBe(HTTP_STATUS.OK);
   ```

8. **Error Handling**: Test error scenarios consistently
   ```typescript
   it('should handle errors', async () => {
     await expect(functionThatThrows()).rejects.toThrow();
   });
   ```

## Test Files Overview

### Integration Tests

- **`auth.test.ts`** - Tests login/logout endpoints with Parse Server
- **`islands.test.ts`** - Tests island CRUD operations with mock data
- **`search.test.ts`** - Tests search functionality across multiple fields
- **`health.test.ts`** - Tests health check endpoint
- **`root.test.ts`** - Tests root endpoint and endpoint listing
- **`triggers.test.ts`** - Tests Parse Cloud triggers (beforeSave/afterSave)

### Unit Tests

- **`errorHandler.test.ts`** - Tests error handling middleware and ApplicationError class
- **`security.test.ts`** - Tests CORS and security headers middleware
- **`auth.middleware.test.ts`** - Tests admin authentication middleware
- **`upload.middleware.test.ts`** - Tests file upload middleware and file filtering
- **`env.test.ts`** - Tests environment variable validation
- **`app.test.ts`** - Tests Express app setup
- **`dashboard.test.ts`** - Tests Parse Dashboard setup
- **`parse.test.ts`** - Tests Parse Server setup
- **`image.test.ts`** - Tests image processing utilities (thumbnail generation, file naming)

## Continuous Integration

Tests run automatically in CI/CD pipelines. Ensure all tests pass before merging:

```bash
npm run test:run
npm run lint
npm run build
```

## Troubleshooting

### Tests timing out

If tests timeout, increase `hookTimeout` in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    hookTimeout: 30000, // 30 seconds
  },
});
```

### Parse Server connection errors

- Ensure `SERVER_URL` is set correctly in test setup
- Verify Parse Server is started before making SDK calls
- Check that Express app has Parse Server mounted

### MongoDB connection errors

- Integration tests use `mongodb-memory-server` - no external MongoDB needed
- Ensure `MongoMemoryServer` is properly initialized and cleaned up

### Coverage not including files

- Check `vitest.config.ts` coverage exclude patterns
- Ensure files are not in `node_modules/`, `dist/`, or excluded patterns

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Parse Server Testing Guide](https://docs.parseplatform.org/parse-server/guide/#testing)
