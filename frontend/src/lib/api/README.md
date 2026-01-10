# Generated API Client

This directory contains auto-generated TypeScript client code for the Travel Blog API, including type definitions and service classes.

## Generation

The API client is generated from the OpenAPI/Swagger specification defined in the backend.

### Method 1: From exported JSON file (recommended for CI/CD)

```bash
# In backend directory
npm run export:openapi

# In frontend directory
npm run generate:api
npm run generate:services
```

Or use the combined command from the frontend (generates both types and services):
```bash
npm run api:generate
```

This command will:
1. Export the OpenAPI spec from the backend
2. Generate TypeScript types (`types.ts`)
3. Generate API client (`client.ts`)
4. Generate service classes (`services/*.service.ts`)

## Generated Files

- **`types.ts`** - TypeScript type definitions for all API endpoints and schemas
- **`client.ts`** - Base API client using `openapi-fetch`
- **`services/`** - Service classes with methods for each endpoint:
  - `authentication.service.ts` - Login, logout
  - `islands.service.ts` - Island CRUD operations
  - `search.service.ts` - Search functionality
  - `health.service.ts` - Health checks
  - `api.service.ts` - Root endpoint
  - `index.ts` - Exports all services

## Usage

### Option 1: Using Service Classes (Recommended)

The service classes provide a clean, type-safe API with automatic authentication handling:

```typescript
import { 
  authenticationService, 
  islandsService, 
  searchService 
} from './lib/api/services';

// Login
const result = await authenticationService.login({
  username: 'admin',
  password: 'password123',
});

if (result.data) {
  const token = result.data.sessionToken;
  // Set auth token on services that need it
  authenticationService.setAuthToken(token);
  islandsService.setAuthToken(token);
}

// Get all islands
const islandsResult = await islandsService.getAllIsland();

// Search islands
const searchResult = await searchService.searchIslands({ q: 'santorini' });

// Update island (requires auth token)
const updateResult = await islandsService.updateIsland('island123', {
  name: 'Updated Island Name',
});

// Upload photo
const uploadResult = await islandsService.uploadPhotoIsland('island123', file);
```

### Option 2: Using Base Client

For more control, you can use the base client directly:

```typescript
import { apiClient, createAuthenticatedClient } from './lib/api/client';
import type { paths } from './lib/api/types';

// For unauthenticated requests
const { data, error } = await apiClient.GET('/api/islands');

// For authenticated requests (after login)
const token = 'your-session-token';
const authClient = createAuthenticatedClient(token);

const loginResult = await authClient.POST('/api/auth/login', {
  body: {
    username: 'admin',
    password: 'password123',
  },
});
```

## Service Classes Features

- **Type-safe methods** - Full TypeScript autocomplete and type checking
- **Automatic authentication** - Set token once, all requests use it
- **Grouped by domain** - Related endpoints grouped together
- **Error handling** - Consistent error handling across all methods
- **File uploads** - Proper FormData handling for multipart uploads

## Regenerating

Regenerate the client whenever the backend API changes:

1. Update your Swagger/OpenAPI annotations in the backend
2. Run `npm run api:generate`
3. The generated files will be updated automatically

**Note:** Do not manually edit files in this directory as they will be overwritten on regeneration.
