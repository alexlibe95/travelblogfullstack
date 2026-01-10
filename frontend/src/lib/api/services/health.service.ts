import { apiClient, createAuthenticatedClient } from '../client';

/**
 * Health Service
 * Auto-generated service class for Health endpoints
 */
export class HealthService {
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
   * Health check
   */
  async checkHealth(): Promise<{ data: unknown; error: null } | { data: null; error: Error }> {
    const { data, error } = await this.getClient().GET('/health');
    
    if (error) {
      throw new Error(`checkHealth failed: ${JSON.stringify(error)}`);
    }
    
    return { data, error: null };
  }

}

// Export singleton instance
export const healthService = new HealthService();
