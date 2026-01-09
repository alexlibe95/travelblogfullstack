import { schemaDefinitions } from './cloud/schema.js';
import { ENVIRONMENTS, MAX_GLOBAL_UPLOAD_SIZE_MB } from './constants/index.js';
import { env } from './src/utils/env.js';

export const config = {
  databaseURI: env.DB_URI,

  cloud: () => import('./cloud/main.js'),

  appId: env.APP_ID,

  masterKey: env.MASTER_KEY,

  serverURL: env.SERVER_URL,

  schema: {
    definitions: schemaDefinitions,
    lockSchemas: true,
    strict: true,
    recreateModifiedFields: false,
    deleteExtraFields: false,
  },

  // File upload limits
  maxUploadSize: MAX_GLOBAL_UPLOAD_SIZE_MB,

  // Production-ready Parse Server options
  ...(env.NODE_ENV === ENVIRONMENTS.PRODUCTION && {
    // Enable request logging in production
    logLevel: 'info',
    // Security: prevent master key from being exposed
    masterKeyIps: process.env.MASTER_KEY_IPS?.split(',') || [],
    // Session configuration
    sessionLength: 31536000, // 1 year in seconds
  }),
};
