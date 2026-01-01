# Travel Blog Backend

A production-ready Parse Server backend for a Travel Blog application, built with TypeScript, Express, and MongoDB.

## 🚀 Features

- **Parse Server** - Backend-as-a-Service with REST API
- **TypeScript** - Type-safe development with strict type checking
- **Environment Validation** - Validates all required configuration at startup
- **Error Handling** - Comprehensive error handling middleware
- **Security** - CORS, security headers, and secure configuration
- **Health Monitoring** - Health check endpoint for monitoring
- **Graceful Shutdown** - Proper cleanup on server shutdown
- **Parse Dashboard** - Web-based admin interface for data management
- **Schema Management** - Code-defined database schemas with validation

## 📋 Prerequisites

- **Node.js** >= 20 (check with `node --version`)
- **MongoDB** - Local installation or remote connection string
- **npm** or **yarn** package manager

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd travelblogfullstack
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your configuration values:

   ```env
   DB_URI=mongodb://localhost:27017/travelblog
   APP_ID=your-app-id-here
   MASTER_KEY=your-master-key-here
   SERVER_URL=http://localhost:1337
   APP_NAME=Travel Blog Dashboard
   APP_USER=admin
   APP_PASS=your-secure-password
   SERVER_PORT=1337
   NODE_ENV=development
   ```

4. **Start MongoDB** (if running locally)

   ```bash
   # macOS with Homebrew
   brew services start mongodb-community

   # Or run manually
   mongod
   ```

5. **Build the project**

   ```bash
   npm run build
   ```

6. **Start the server**

   ```bash
   npm start
   ```

   For development with auto-reload:

   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
travelblogfullstack/
├── cloud/                 # Parse Cloud Code
│   ├── main.ts          # Cloud functions
│   └── schema.ts        # Database schema definitions
├── src/                  # Source code
│   ├── middleware/      # Express middleware
│   │   ├── errorHandler.ts
│   │   └── security.ts
│   └── utils/           # Utility functions
│       └── env.ts       # Environment validation
├── constants/           # Application constants
│   └── routes.ts        # Route definitions
├── types/               # TypeScript type definitions
├── config.ts           # Parse Server configuration
├── index.ts            # Application entry point
└── dist/               # Compiled JavaScript (generated)
```

## 🎯 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier

## 🌐 API Endpoints

### Base URL

- **Development**: `http://localhost:1337`
- **Production**: Set via `SERVER_URL` environment variable

### Endpoints

- **Root**: `GET /` - Server information and available endpoints
- **Health Check**: `GET /health` - Server health status
- **Parse API**: `/parse/*` - All Parse Server endpoints
- **Dashboard**: `/dashboard` - Parse Dashboard admin interface

### Parse API Examples

#### Health Check

```bash
curl http://localhost:1337/health
```

#### Create an Island (example)

```bash
curl -X POST \
  -H "X-Parse-Application-Id: YOUR_APP_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Santorini",
    "short_description": "Beautiful Greek island",
    "description": "A stunning island in the Aegean Sea...",
    "order": 1
  }' \
  http://localhost:1337/parse/classes/Island
```

#### Query Islands

```bash
curl -X GET \
  -H "X-Parse-Application-Id: YOUR_APP_ID" \
  http://localhost:1337/parse/classes/Island
```

#### Call Cloud Function

```bash
curl -X POST \
  -H "X-Parse-Application-Id: YOUR_APP_ID" \
  -H "Content-Type: application/json" \
  -d "{}" \
  http://localhost:1337/parse/functions/hello
```

## 🗄️ Database Schema

The application uses Parse Server's schema management system. Schemas are defined in `cloud/schema.ts`.

### Current Schema: Island

- `name` (String, required) - Island name
- `short_description` (String, required) - Brief description
- `description` (String, required) - Full description
- `order` (Number, required) - Display order
- `site` (String, optional) - Website URL
- `photo` (File, optional) - Main photo
- `photo_thumb` (File, optional) - Thumbnail photo
- `location` (GeoPoint, optional) - Geographic coordinates

**Permissions**: Public read, Admin-only write

## 🔒 Security Features

- **Environment Variable Validation** - Ensures all required config is present
- **CORS Configuration** - Configurable allowed origins
- **Security Headers** - X-Frame-Options, CSP, HSTS, etc.
- **Secure Dashboard** - HTTPS-only in production
- **Error Handling** - Prevents information leakage
- **Type Safety** - Strict TypeScript configuration

## 🧪 Development

### Environment Variables

All environment variables are validated at startup. See `.env.example` for the complete list of required variables.

### Code Quality

- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **TypeScript** - Strict type checking enabled

### Adding New Features

1. **Cloud Functions**: Add to `cloud/main.ts`
2. **Schema Changes**: Update `cloud/schema.ts`
3. **Middleware**: Add to `src/middleware/`
4. **Utilities**: Add to `src/utils/`

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

For production, consider using:

- **PM2**: `pm2 start dist/index.js`
- **Docker**: See deployment documentation
- **Systemd**: Create a service file

## 🐛 Troubleshooting

### "Missing required environment variables" error

- Ensure `.env` file exists and contains all required variables
- Check variable names match exactly (case-sensitive)

### MongoDB connection issues

- Verify MongoDB is running: `mongosh` or `mongo`
- Check `DB_URI` format: `mongodb://host:port/database`
- Ensure network access if using remote MongoDB

### Port already in use

- Change `SERVER_PORT` in `.env`
- Or stop the process using the port

### TypeScript compilation errors

- Run `npm run build` to see detailed errors
- Ensure all imports use `.js` extension (ESM requirement)

## 📝 License

This project is for assignment purposes.

## 🙏 Acknowledgments

Built with:

- [Parse Server](https://github.com/parse-community/parse-server)
- [Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [MongoDB](https://www.mongodb.com/)
