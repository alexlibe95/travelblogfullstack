# Generated API Client

This directory contains auto-generated TypeScript client code for the Travel Blog API.

## Generation

The API client is generated from the OpenAPI/Swagger specification defined in the backend.

### Method 1: From exported JSON file (recommended for CI/CD)

```bash
# In backend directory
npm run export:openapi

# In frontend directory
npm run generate:api
```

Or use the combined command from the frontend:
```bash
npm run api:generate
```

### Method 2: From running server

If your backend server is running, you can generate directly from the API endpoint:

```bash
npm run generate:api:url
```

You can also specify a custom URL:
```bash
API_DOCS_URL=http://localhost:5000/api-docs.json npm run generate:api:url
```

## Usage

After generation, import and use the API client in your Angular components:

```typescript
// Import the generated API client
import { apiClient, createAuthenticatedClient } from './lib/api';
import type { paths } from './lib/api/types';

// For unauthenticated requests
const { data, error } = await apiClient.GET('/api/islands');

// For authenticated requests (after login)
const token = 'your-session-token';
const authClient = createAuthenticatedClient(token);

// Example: Login
const loginResult = await authClient.POST('/api/auth/login', {
  body: {
    username: 'admin',
    password: 'password123',
  },
});

// Example: Get islands (public endpoint)
const islandsResult = await apiClient.GET('/api/islands');

// Example: Update island (requires auth)
const updateResult = await authClient.PUT('/api/islands/{id}', {
  params: {
    path: { id: 'island123' },
  },
  body: {
    name: 'Updated Island Name',
  },
});
```

The generated types (`paths`) provide full TypeScript autocomplete and type safety for all your API endpoints. Check `src/lib/api/types.ts` to see all available endpoints and their request/response types.

## Regenerating

Regenerate the client whenever the backend API changes:

1. Update your Swagger/OpenAPI annotations in the backend
2. Run the generation command
3. The generated files will be updated automatically

**Note:** Do not manually edit files in this directory as they will be overwritten on regeneration.
