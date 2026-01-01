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

## Test Structure

```
tests/
└── integration/          # Integration tests
    └── health.test.ts   # Health endpoint tests

src/
├── utils/
│   └── env.test.ts      # Environment validation tests
└── middleware/
    ├── errorHandler.test.ts  # Error handler tests
    └── security.test.ts      # Security middleware tests
```

## Writing Tests

### Unit Tests

Unit tests are co-located with their source files using the `.test.ts` extension.

Example:
```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myModule.js';

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction()).toBe(expected);
  });
});
```

### Integration Tests

Integration tests are located in the `tests/integration/` directory and test multiple components working together.

Example:
```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('API Endpoint', () => {
  it('should return 200', async () => {
    const response = await request(app).get('/endpoint');
    expect(response.status).toBe(200);
  });
});
```

## Test Coverage

The project aims for good test coverage. Run coverage reports with:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.

## Best Practices

1. **Test Naming**: Use descriptive test names that explain what is being tested
2. **AAA Pattern**: Arrange, Act, Assert - structure your tests clearly
3. **Isolation**: Each test should be independent and not rely on other tests
4. **Mocking**: Mock external dependencies (databases, APIs, etc.)
5. **Edge Cases**: Test both happy paths and error cases
6. **Cleanup**: Clean up after tests (reset mocks, clear state)

## Environment Variables in Tests

Tests use a separate test environment. Set up test environment variables in test files:

```typescript
beforeEach(() => {
  process.env.TEST_VAR = 'test-value';
});
```

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
  mockedFunction: vi.fn(),
}));
```

## Continuous Integration

Tests run automatically in CI/CD pipelines. Ensure all tests pass before merging:

```bash
npm run test:run
npm run lint
```

