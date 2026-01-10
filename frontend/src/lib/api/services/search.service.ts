import { apiClient, createAuthenticatedClient } from '../client';

/**
 * Search Service
 * Auto-generated service class for Search endpoints
 */
export class SearchService {
  private client = apiClient;
  private authToken: string | null = null;

  /**
   * Set authentication token for authenticated requests
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  private getClient() {
    if (this.authToken) {
      return createAuthenticatedClient(this.authToken);
    }
    return this.client;
  }

  /**
   * Search islands
   */
  async searchIslands(query: { q: string }): Promise<{ data: unknown; error: null } | { data: null; error: Error }> {
    const { data, error } = await this.getClient().GET('/api/search', {
      params: {
        query,
      },
    });
    
    if (error) {
      throw new Error(`searchIslands failed: ${JSON.stringify(error)}`);
    }
    
    return { data, error: null };
  }

}

// Export singleton instance
export const searchService = new SearchService();
