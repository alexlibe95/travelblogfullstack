export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  ROUTE_NOT_FOUND: 'Route not found',
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found',
} as const;

export const ERROR_RESPONSE_KEYS = {
  ERROR: 'error',
  MESSAGE: 'message',
  STATUS_CODE: 'statusCode',
  STACK: 'stack',
} as const;

export const API_RESPONSE_KEYS = {
  SUCCESS: 'success',
  COUNT: 'count',
  DATA: 'data',
} as const;

export const ISLAND_ERROR_MESSAGES = {
  ID_REQUIRED: 'Island ID is required',
  NOT_FOUND: 'Island not found',
  FETCH_FAILED: 'Failed to fetch islands',
  FETCH_ONE_FAILED: 'Failed to fetch island',
} as const;
