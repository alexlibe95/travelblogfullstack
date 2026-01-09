import Parse from 'parse/node.js';
import { logger } from '../utils/logger.js';

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      message?: string;
      responseTime?: number;
    };
    parseServer: {
      status: 'ok' | 'error';
      message?: string;
      responseTime?: number;
    };
  };
}

/**
 * Check database connection by performing a simple Parse query
 */
async function checkDatabase(): Promise<{ status: 'ok' | 'error'; message?: string; responseTime: number }> {
  const startTime = Date.now();
  try {
    // Perform a simple query to check database connectivity
    // Using _Installation class as it's lightweight and always exists
    const query = new Parse.Query('_Installation');
    query.limit(1);
    await query.find({ useMasterKey: true });

    const responseTime = Date.now() - startTime;
    return {
      status: 'ok',
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error({ error }, 'Database health check failed');
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Database connection failed',
      responseTime,
    };
  }
}

/**
 * Check Parse Server status by verifying it can respond to requests
 */
async function checkParseServer(): Promise<{ status: 'ok' | 'error'; message?: string; responseTime: number }> {
  const startTime = Date.now();
  try {
    // Check if Parse Server is initialized and can respond
    // We'll verify by checking if Parse SDK is configured correctly
    if (!Parse.applicationId || !Parse.serverURL) {
      return {
        status: 'error',
        message: 'Parse Server not initialized',
        responseTime: Date.now() - startTime,
      };
    }

    // Perform a lightweight operation to verify Parse Server is responding
    // Using a simple query to _Installation class
    const query = new Parse.Query('_Installation');
    query.limit(1);
    await query.find({ useMasterKey: true });

    const responseTime = Date.now() - startTime;
    return {
      status: 'ok',
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    logger.error({ error }, 'Parse Server health check failed');
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Parse Server not responding',
      responseTime,
    };
  }
}

/**
 * Perform comprehensive health check
 */
export async function performHealthCheck(
  environment: string,
  version: string
): Promise<HealthCheckResult> {
  const [databaseCheck, parseServerCheck] = await Promise.all([
    checkDatabase(),
    checkParseServer(),
  ]);

  // Determine overall status
  let overallStatus: 'ok' | 'degraded' | 'error' = 'ok';
  if (databaseCheck.status === 'error' || parseServerCheck.status === 'error') {
    overallStatus = 'error';
  } else if (databaseCheck.status === 'ok' && parseServerCheck.status === 'ok') {
    overallStatus = 'ok';
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment,
    version,
    checks: {
      database: databaseCheck,
      parseServer: parseServerCheck,
    },
  };
}
