# Travel Blog Backend API

A production-ready Parse Server backend for a Travel Blog application, built with TypeScript, Express.js, and MongoDB. This backend provides a RESTful API for managing travel destinations (islands) with features like authentication, search, image uploads, and automatic thumbnail generation.

## 🚀 Features

### Core Features
- **Parse Server Integration** - Full Backend-as-a-Service with REST API
- **TypeScript** - Type-safe development with strict type checking
- **RESTful API** - Clean API endpoints for islands, search, and authentication
- **Image Management** - Automatic thumbnail generation for uploaded photos
- **Authentication** - User login/logout with session management
- **Search Functionality** - Multi-field search across island names and descriptions

### Production Features
- **Environment Validation** - Validates all required configuration at startup
- **Structured Logging** - Fast, structured logging with Pino (JSON in production, pretty in development)
- **Error Handling** - Comprehensive error handling middleware with proper error responses
- **Security** - CORS, security headers, and secure configuration
- **Health Monitoring** - Health check endpoint for monitoring and load balancers
- **Graceful Shutdown** - Proper cleanup on server shutdown (SIGTERM/SIGINT)
- **Parse Dashboard** - Web-based admin interface for data management
- **Schema Management** - Code-defined database schemas with validation
- **Testing** - Comprehensive unit and integration tests with Vitest

## 📋 Prerequisites

- **Node.js** >= 20.x (check with `node --version`)
- **MongoDB** >= 6.0 (local installation or remote connection string)
- **npm** >= 9.x or **yarn** >= 1.x

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd travelblogfullstack
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Or create `.env` manually with the following variables:

```env
# Database
DB_URI=mongodb://localhost:27017/travelblog

# Parse Server Configuration
APP_ID=your-unique-app-id-here
MASTER_KEY=your-very-secure-master-key-here
SERVER_URL=http://localhost:5000

# Parse Dashboard Configuration
APP_NAME=Travel Blog Dashboard
APP_USER=admin
APP_PASS=your-secure-password-here

# Server Configuration
SERVER_PORT=5000
NODE_ENV=development

# Optional: Logging
LOG_LEVEL=debug  # Options: trace, debug, info, warn, error, fatal (default: info in production, debug in development)

# Optional: Image Processing
THUMB_WIDTH=300
THUMB_HEIGHT=300
```

**⚠️ Security Note**: Never commit `.env` files to version control. Use strong, unique values for `MASTER_KEY` and `APP_PASS` in production.

### 4. Start MongoDB

**macOS (Homebrew)**:
```bash
brew services start mongodb-community
# Or run manually
mongod --config /usr/local/etc/mongod.conf
```

**Linux**:
```bash
sudo systemctl start mongod
# Or run manually
mongod
```

**Docker**:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Build the Project

```bash
npm run build
```

### 6. Start the Server

**Production**:
```bash
npm start
```

**Development** (with auto-reload):
```bash
npm run dev
```

The server will start on `http://localhost:5000` (or your configured `SERVER_PORT`).

## 📁 Project Structure

```
travelblogfullstack/
├── cloud/                      # Parse Cloud Code
│   ├── main.ts                # Cloud functions entry point
│   ├── schema.ts               # Database schema definitions
│   ├── triggers/               # Parse Cloud triggers
│   │   └── island.triggers.ts  # Island beforeSave/afterSave triggers
│   └── utils/                 # Cloud utility functions
│       └── image.ts            # Image processing utilities
├── src/                        # Source code
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── islands.controller.ts
│   │   └── search.controller.ts
│   ├── middleware/            # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.ts
│   │   ├── security.ts
│   │   └── upload.middleware.ts
│   ├── routes/                # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── islands.routes.ts
│   │   ├── search.routes.ts
│   │   ├── health.routes.ts
│   │   ├── root.routes.ts
│   │   ├── swagger.routes.ts
│   │   └── index.ts
│   ├── config/               # Configuration files
│   │   └── swagger.ts        # Swagger/OpenAPI configuration
│   ├── server/                # Server setup
│   │   ├── app.ts             # Express app configuration
│   │   ├── parse.ts           # Parse Server setup
│   │   └── dashboard.ts      # Parse Dashboard setup
│   └── utils/                 # Utility functions
│       └── env.ts             # Environment validation
├── constants/                 # Application constants
│   ├── files.ts              # File-related constants
│   ├── http.ts               # HTTP status codes and messages
│   ├── islands.ts            # Island-related constants
│   ├── routes.ts             # Route definitions
│   ├── security.ts           # Security-related constants
│   └── index.ts              # Constants barrel export
├── types/                     # TypeScript type definitions
├── tests/                     # Test files
│   ├── integration/         # Integration tests
│   │   ├── auth.test.ts
│   │   ├── islands.test.ts
│   │   ├── search.test.ts
│   │   ├── health.test.ts
│   │   └── root.test.ts
│   ├── setup.ts              # Test environment setup
│   └── README.md             # Testing documentation
├── config.ts                 # Parse Server configuration
├── index.ts                  # Application entry point
├── vitest.config.ts          # Vitest test configuration
├── tsconfig.json             # TypeScript configuration
└── dist/                     # Compiled JavaScript (generated)
```

## 🎯 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the production server |
| `npm run dev` | Start development server with auto-reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once (CI mode) |
| `npm run test:ui` | Run tests with Vitest UI |
| `npm run test:coverage` | Run tests with coverage report (text, JSON, HTML) |
| `npm run test:coverage:open` | Run tests with coverage and open HTML report (macOS/Linux: `open`, Windows: manually open `coverage/index.html`) |
| `npm run test:coverage:watch` | Run tests with coverage in watch mode |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Fix ESLint errors automatically |
| `npm run format` | Format code with Prettier |

## 🌐 API Endpoints

### Base URL
- **Development**: `http://localhost:5000`
- **Production**: Set via `SERVER_URL` environment variable

### Public Endpoints

#### Root
```
GET /
```
Returns server information and available endpoints.

**Response**:
```json
{
  "message": "Parse Server is running 🚀",
  "endpoints": {
    "parse": "/parse",
    "dashboard": "/dashboard",
    "health": "/health",
    "api": {
      "islands": "/api/islands",
      "search": "/api/search",
      "auth": {
        "login": "/api/auth/login",
        "logout": "/api/auth/logout"
      }
    }
  }
}
```

#### Health Check
```
GET /health
```
Returns server health status.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-09T14:30:00.000Z",
  "uptime": 1234.56,
  "environment": "development"
}
```

### API Endpoints

#### Authentication

**Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

**Response**:
```json
{
  "success": true,
  "sessionToken": "r:abc123...",
  "user": {
    "id": "user123",
    "username": "admin"
  }
}
```

**Logout**
```
POST /api/auth/logout
X-Parse-Session-Token: r:abc123...
```

**Response**:
```json
{
  "success": true
}
```

#### Islands

**Get All Islands** (List View)
```
GET /api/islands
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "objectId": "island123",
      "name": "Santorini",
      "short_description": "Beautiful Greek island",
      "photo_thumb": "https://...",
      "order": 1
    }
  ]
}
```

**Get Island by ID** (Detail View)
```
GET /api/islands/:id
```

**Response**:
```json
{
  "success": true,
  "data": {
    "objectId": "island123",
    "name": "Santorini",
    "short_description": "Beautiful Greek island",
    "description": "Full description...",
    "site": "https://santorini.com",
    "photo": "https://...",
    "photo_thumb": "https://...",
    "location": {
      "latitude": 36.3932,
      "longitude": 25.4615
    },
    "order": 1,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

**Update Island** (Admin Only)
```
PUT /api/islands/:id
X-Parse-Session-Token: r:abc123...
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Upload Island Photo** (Admin Only)
```
POST /api/islands/:id/photo
X-Parse-Session-Token: r:abc123...
Content-Type: multipart/form-data

file: [image file]
```

**Response**:
```json
{
  "success": true,
  "photoUrl": "https://..."
}
```

#### Search

**Search Islands**
```
GET /api/search?q=santorini
```

**Response**:
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "island123",
      "name": "Santorini"
    }
  ]
}
```

### Parse Server Endpoints

All Parse Server endpoints are available under `/parse/*`:

- `POST /parse/classes/Islands` - Create island
- `GET /parse/classes/Islands` - Query islands
- `GET /parse/classes/Islands/:id` - Get island
- `PUT /parse/classes/Islands/:id` - Update island
- `DELETE /parse/classes/Islands/:id` - Delete island

See [Parse Server REST API Documentation](https://docs.parseplatform.org/rest/guide/) for details.

### Parse Dashboard

Access the admin dashboard at:
```
http://localhost:5000/dashboard
```

Login with credentials from `APP_USER` and `APP_PASS` environment variables.

### API Documentation (Swagger)

Interactive API documentation is available at:
```
http://localhost:5000/api-docs
```

The Swagger UI provides:
- Complete API endpoint documentation
- Request/response schemas
- Try-it-out functionality to test endpoints
- Authentication support (session token)

All API endpoints are documented with:
- Request parameters and body schemas
- Response schemas and status codes
- Authentication requirements
- Example requests and responses

## 🗄️ Database Schema

The application uses Parse Server's schema management system. Schemas are defined in `cloud/schema.ts`.

### Islands Class

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Island name |
| `short_description` | String | Yes | Brief description |
| `description` | String | Yes | Full description |
| `order` | Number | Yes | Display order |
| `site` | String | No | Website URL |
| `photo` | File | No | Main photo |
| `photo_thumb` | File | No | Thumbnail (auto-generated) |
| `location` | GeoPoint | No | Geographic coordinates |

**Permissions**:
- **Read**: Public (anyone can read)
- **Write**: Admin only (requires authentication)

**Automatic Features**:
- Thumbnail generation on photo upload (via `afterSave` trigger)
- Photo size validation (max 5MB via `beforeSave` trigger)

## 🔒 Security Features

### Environment Variable Validation
- All required environment variables are validated at startup
- Missing variables cause the application to fail fast with clear error messages

### CORS Configuration
- Configurable allowed origins
- Development: `http://localhost:3000`, `http://localhost:4200`, `http://localhost:5173`
- Production: Configure via `ALLOWED_ORIGINS` environment variable

### Security Headers
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: strict-origin-when-cross-origin` - Referrer policy

### Rate Limiting
- **Development**: 1000 requests per 15 minutes per IP
- **Production**: 100 requests per 15 minutes per IP
- **Excluded Routes**: Health checks (`/health`), Dashboard (`/dashboard/*`), and API docs (`/api-docs`) are excluded from rate limiting
- **Note**: For production with multiple servers, consider using Redis store for distributed rate limiting

### Error Handling
- Prevents information leakage in production
- Stack traces only shown in development
- Consistent error response format

### Logging
- **Structured Logging** - Uses Pino for fast, structured JSON logging
- **Development Mode** - Pretty-printed logs with colors for easier debugging
- **Production Mode** - JSON logs optimized for log aggregation tools (ELK, CloudWatch, etc.)
- **Log Levels** - Configurable via `LOG_LEVEL` environment variable:
  - `trace` - Very detailed debugging information
  - `debug` - Debug information (default in development)
  - `info` - General information (default in production)
  - `warn` - Warning messages
  - `error` - Error messages
  - `fatal` - Critical errors
- **Contextual Logging** - All logs include relevant context (request IDs, user IDs, error details)
- **Performance** - Pino is one of the fastest Node.js loggers, with minimal overhead

### Authentication
- Session-based authentication
- Secure session token handling
- Admin role-based access control

## 🧪 Testing

### Running Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Co-located with source files (`*.test.ts`)
- **Integration Tests**: Located in `tests/integration/`

### Test Coverage

The project includes comprehensive tests for:
- ✅ All middleware (error handling, security, auth, upload)
- ✅ Environment validation
- ✅ All API endpoints (auth, islands, search, health, root)
- ✅ Error handling scenarios
- ✅ Server setup functions
- ✅ Image processing utilities

**Current Coverage**: ~85% overall

**View Coverage Reports**:
```bash
# Generate coverage report
npm run test:coverage

# Open HTML coverage report
npm run test:coverage:open  # macOS/Linux
# Or manually open coverage/index.html in your browser

# Coverage report is generated in coverage/ directory:
# - coverage/index.html - Interactive HTML report
# - coverage/coverage-final.json - JSON report
```

See `tests/README.md` for detailed testing documentation.

## 🚢 Deployment

### Environment Setup

1. Set all required environment variables
2. Ensure MongoDB is accessible
3. Set `NODE_ENV=production`
4. Configure `ALLOWED_ORIGINS` for CORS
5. Use HTTPS in production (set `SERVER_URL` to HTTPS)

### Build for Production

```bash
npm run build
npm start
```

### Process Management

**PM2**:
```bash
npm install -g pm2
pm2 start dist/index.js --name travelblog-api
pm2 save
pm2 startup
```

**Docker** (example):
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

**Systemd** (example service file):
```ini
[Unit]
Description=Travel Blog API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/travelblog-api
ExecStart=/usr/bin/node dist/index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

## 🐛 Troubleshooting

### "Missing required environment variables" error

- Ensure `.env` file exists and contains all required variables
- Check variable names match exactly (case-sensitive)
- Verify no extra spaces or quotes around values

### MongoDB connection issues

- Verify MongoDB is running: `mongosh` or `mongo`
- Check `DB_URI` format: `mongodb://host:port/database`
- Ensure network access if using remote MongoDB
- Check MongoDB logs for connection errors

### Port already in use

- Change `SERVER_PORT` in `.env`
- Or stop the process using the port:
  ```bash
  # Find process
  lsof -i :5000
  # Kill process
  kill -9 <PID>
  ```

### TypeScript compilation errors

- Run `npm run build` to see detailed errors
- Ensure all imports use `.js` extension (ESM requirement)
- Check `tsconfig.json` for correct configuration

### Parse Server errors

- Check Parse Server logs in `logs/` directory
- Verify `APP_ID` and `MASTER_KEY` are correct
- Ensure MongoDB connection is working
- Check schema definitions match database structure

### Image upload issues

- Verify file size is under 5MB
- Check file is a valid image format (JPEG, PNG, GIF, WebP)
- Ensure Sharp library is installed correctly
- Check file permissions and disk space

## 📝 Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with TypeScript rules
- **Prettier**: Code formatting
- **Indentation**: 2 spaces
- **Line Endings**: LF (Unix)

### Adding New Features

1. **New API Endpoint**:
   - Add controller in `src/controllers/`
   - Add route in `src/routes/`
   - Register route in `src/routes/index.ts`
   - Add integration test in `tests/integration/`

2. **New Middleware**:
   - Add middleware in `src/middleware/`
   - Add unit test co-located with middleware
   - Register in `src/server/app.ts`

3. **New Cloud Function**:
   - Add function in `cloud/main.ts`
   - Add trigger in `cloud/triggers/` if needed
   - Update schema in `cloud/schema.ts` if needed

4. **New Constants**:
   - Add constants in appropriate file in `constants/`
   - Export from `constants/index.ts`

### Git Workflow

- Use descriptive commit messages
- Keep commits focused and atomic
- Run tests before committing: `npm run test:run`
- Run linter before committing: `npm run lint`

## 📚 Additional Resources

- [Parse Server Documentation](https://docs.parseplatform.org/parse-server/guide/)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vitest Documentation](https://vitest.dev/)

## 📄 License

This project is for assignment purposes.

## 🙏 Acknowledgments

Built with:
- [Parse Server](https://github.com/parse-community/parse-server) - Backend framework
- [Express](https://expressjs.com/) - Web framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [MongoDB](https://www.mongodb.com/) - Database
- [Vitest](https://vitest.dev/) - Testing framework
- [Sharp](https://sharp.pixelplumbing.com/) - Image processing

---

**Version**: 1.0.0  
**Last Updated**: January 2026
