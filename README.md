# Travel Blog Full Stack

A full-stack travel blog application with a Parse Server backend and frontend.

## Project Structure

```
travelblogfullstack/
├── backend/          # Parse Server backend API
│   ├── src/         # Backend source code
│   ├── cloud/       # Parse Cloud Code
│   ├── tests/       # Backend tests
│   └── README.md    # Backend documentation
├── frontend/         # Frontend application (to be implemented)
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

Frontend implementation coming soon.

## Development

- **Backend**: Parse Server API with TypeScript, Express.js, and MongoDB
- **Frontend**: Angular application with auto-generated API client

## API Client Generation

The frontend includes an auto-generated TypeScript API client created from the backend's Swagger/OpenAPI specification.

### Generating the API Client

**Option 1: From exported JSON (recommended)**
```bash
# From frontend directory
npm run api:generate
```

This will:
1. Export the OpenAPI spec from the backend to `backend/openapi.json`
2. Generate TypeScript client code in `frontend/src/lib/api`

**Option 2: From running server**
```bash
# Make sure backend is running first
cd backend && npm run dev

# In another terminal, from frontend directory
npm run generate:api:url
```

### Using the Generated Client

See [frontend/src/lib/api/README.md](./frontend/src/lib/api/README.md) for detailed usage examples.

**Quick example:**
```typescript
import { ApiClient } from './lib/api';
import { AuthService } from './lib/api/services/AuthService';

const apiClient = new ApiClient({ baseUrl: 'http://localhost:5000' });
const authService = new AuthService(apiClient);
const result = await authService.login({ username: 'admin', password: 'pass' });
```

### Regenerating After API Changes

Whenever you update the backend API (add endpoints, change schemas, etc.):
1. Update your Swagger annotations in the backend controllers
2. Run `npm run api:generate` from the frontend directory
3. The generated client will be updated automatically

## Documentation

- [Backend Documentation](./backend/README.md)
- [Backend Testing Guide](./backend/tests/README.md)
- [API Client Usage](./frontend/src/lib/api/README.md)