import type { paths } from './types';
import createClient from 'openapi-fetch';
import { environment } from '../../environments/environment';

export type ApiPaths = paths;

const baseUrl = environment.apiBaseUrl;

export const apiClient = createClient<ApiPaths>({
  baseUrl,
});

// Helper to create a client with auth token
export function createAuthenticatedClient(token: string) {
  return createClient<ApiPaths>({
    baseUrl,
    headers: {
      'x-parse-session-token': token,
    },
  });
}

export default apiClient;
