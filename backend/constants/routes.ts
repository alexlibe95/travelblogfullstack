export const ROUTES = {
  ROOT: '/',
  PARSE: '/parse',
  DASHBOARD: '/dashboard',
  PUBLIC: '/public',
  HEALTH: '/health',
  API: {
    ISLANDS: '/api/islands',
    ISLANDS_LATEST: '/api/islands/latest',
    SEARCH: '/api/search',
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
    },
    DOCS: '/api-docs',
  },
} as const;
