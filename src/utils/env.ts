/**
 * Environment variable validation and configuration
 * Ensures all required environment variables are present before startup
 */

interface EnvConfig {
  // Database
  DB_URI: string;

  // Parse Server
  APP_ID: string;
  MASTER_KEY: string;
  SERVER_URL: string;

  // Parse Dashboard
  APP_NAME: string;
  APP_USER: string;
  APP_PASS: string;

  // Server
  SERVER_PORT: string;

  // Optional
  NODE_ENV?: string;
  PARSE_MOUNT?: string;
}

const requiredEnvVars: (keyof EnvConfig)[] = [
  'DB_URI',
  'APP_ID',
  'MASTER_KEY',
  'SERVER_URL',
  'APP_NAME',
  'APP_USER',
  'APP_PASS',
  'SERVER_PORT',
];

/**
 * Validates that all required environment variables are set
 * @throws Error if any required variable is missing
 */
export function validateEnv(): EnvConfig {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file or environment configuration.'
    );
  }

  return {
    DB_URI: process.env.DB_URI!,
    APP_ID: process.env.APP_ID!,
    MASTER_KEY: process.env.MASTER_KEY!,
    SERVER_URL: process.env.SERVER_URL!,
    APP_NAME: process.env.APP_NAME!,
    APP_USER: process.env.APP_USER!,
    APP_PASS: process.env.APP_PASS!,
    SERVER_PORT: process.env.SERVER_PORT!,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PARSE_MOUNT: process.env.PARSE_MOUNT || '/parse',
  };
}

/**
 * Get validated environment configuration
 */
export const env = validateEnv();
