export const ROUTES = {
  ROOT: '/',
  PARSE: '/parse',
  DASHBOARD: '/dashboard',
  PUBLIC: '/public',
  HEALTH: '/health',
  API: {
    ISLANDS: '/api/islands',
    SEARCH: '/api/search',
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
    },
  },
} as const;
