import { apiClient, createAuthenticatedClient } from '../client';

/**
 * Api Service
 * Auto-generated service class for Api endpoints
 */
export class ApiService {
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
   * Root endpoint
   */
  async getRootInfo(): Promise<{ data: unknown; error: null } | { data: null; error: Error }> {
    const { data, error } = await this.getClient().GET('/');

    if (error) {
      throw new Error(`getRootInfo failed: ${JSON.stringify(error)}`);
    }

    return { data, error: null };
  }
}

// Export singleton instance
export const apiService = new ApiService();
