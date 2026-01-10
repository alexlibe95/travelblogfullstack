# Travel Blog Full Stack

A full-stack travel blog application with a Parse Server backend and frontend.

## Project Structure

```
travelblogfullstack/
├── backend/          # Parse Server backend API
│   ├── src/         # Backend source code
│   ├── cloud/       # Parse Cloud Code
│   ├── tests/       # Backend tests
│   ├── openapi.json # Exported OpenAPI specification
│   └── README.md    # Backend documentation
├── frontend/         # Angular frontend application
│   ├── src/
│   │   ├── app/     # Angular application code
│   │   └── lib/
│   │       └── api/  # Auto-generated API client and services
│   └── README.md    # Frontend documentation
└── README.md         # This file
```

## Quick Start

### Backend

See [backend/README.md](./backend/README.md) for backend setup and documentation.

```bash
cd backend
npm install
npm run dev
```

### Frontend

See [frontend/README.md](./frontend/README.md) for frontend setup and documentation.

```bash
cd frontend
npm install
npm start
```

The frontend automatically generates the API client before starting (via `prestart` hook).

## Development

- **Backend**: Parse Server API with TypeScript, Express.js, and MongoDB
- **Frontend**: Angular application with auto-generated API client

## API Client Generation

The frontend includes auto-generated TypeScript API client code created from the backend's Swagger/OpenAPI specification. This includes:

- **Type definitions** (`types.ts`) - Full TypeScript types for all endpoints and schemas
- **Base client** (`client.ts`) - Type-safe fetch client using `openapi-fetch`
- **Service classes** (`services/*.service.ts`) - High-level service classes with methods for each endpoint

### Generating the API Client

**Option 1: From exported JSON (recommended)**
```bash
# From frontend directory
npm run api:generate
```

This will:
1. Export the OpenAPI spec from the backend to `backend/openapi.json`
2. Generate TypeScript types and client in `frontend/src/lib/api`
3. Generate service classes in `frontend/src/lib/api/services`

**Option 2: Manual generation**
```bash
# Export OpenAPI spec
cd backend && npm run export:openapi

# Generate types and client
cd ../frontend && npm run generate:api

# Generate service classes
npm run generate:services
```

### Using the Generated Client

See [frontend/src/lib/api/README.md](./frontend/src/lib/api/README.md) for detailed usage examples.

**Quick example:**
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

if (result.data?.sessionToken) {
  // Set auth token for authenticated requests
  authenticationService.setAuthToken(result.data.sessionToken);
  islandsService.setAuthToken(result.data.sessionToken);
}

// Get all islands
const islands = await islandsService.getAllIsland();

// Search islands (case-insensitive)
const searchResults = await searchService.searchIslands({ q: 'santorini' });
```

### Regenerating After API Changes

Whenever you update the backend API (add endpoints, change schemas, etc.):
1. Update your Swagger annotations in the backend controllers
2. Run `npm run api:generate` from the frontend directory
3. The generated types, client, and services will be updated automatically

**Note:** The API client is automatically regenerated before starting the dev server (`npm start`) and before building (`npm run build`).

## Documentation

- [Backend Documentation](./backend/README.md)
- [Backend Testing Guide](./backend/tests/README.md)
- [API Client Usage](./frontend/src/lib/api/README.md)