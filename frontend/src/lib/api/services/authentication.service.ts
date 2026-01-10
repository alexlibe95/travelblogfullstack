import { apiClient, createAuthenticatedClient } from '../client';
import type { components } from '../types';

/**
 * Authentication Service
 * Auto-generated service class for Authentication endpoints
 */
export class AuthenticationService {
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
   * User login
   */
  async login(body: components['schemas']['LoginRequest']): Promise<{ data: unknown; error: null } | { data: null; error: Error }> {
    const { data, error } = await this.getClient().POST('/api/auth/login', {
      body,
    });
    
    if (error) {
      throw new Error(`login failed: ${JSON.stringify(error)}`);
    }
    
    return { data, error: null };
  }

  /**
   * User logout
   */
  async logout(): Promise<{ data: unknown; error: null } | { data: null; error: Error }> {
    const { data, error } = await this.getClient().POST('/api/auth/logout');
    
    if (error) {
      throw new Error(`logout failed: ${JSON.stringify(error)}`);
    }
    
    return { data, error: null };
  }

}

// Export singleton instance
export const authenticationService = new AuthenticationService();
