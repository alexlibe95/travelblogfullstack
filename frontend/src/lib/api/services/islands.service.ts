import { apiClient, createAuthenticatedClient } from '../client';
import type { components } from '../types';

/**
 * Islands Service
 * Auto-generated service class for Islands endpoints
 */
export class IslandsService {
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
   * Get all islands (list view)
   */
  async getAllIsland(): Promise<{ data: unknown; error: null } | { data: null; error: Error }> {
    const { data, error } = await this.getClient().GET('/api/islands');
    
    if (error) {
      throw new Error(`getAllIsland failed: ${JSON.stringify(error)}`);
    }
    
    return { data, error: null };
  }

  /**
   * Get latest modified islands
   */
  async getAllLatest(): Promise<{ data: unknown; error: null } | { data: null; error: Error }> {
    const { data, error } = await this.getClient().GET('/api/islands/latest');
    
    if (error) {
      throw new Error(`getAllLatest failed: ${JSON.stringify(error)}`);
    }
    
    return { data, error: null };
  }

  /**
   * Get island by ID (detail view)
   */
  async getByIdIsland(id: string): Promise<{ data: unknown; error: null } | { data: null; error: Error }> {
    const { data, error } = await this.getClient().GET('/api/islands/{id}', {
      params: {
        path: { id },
      },
    });
    
    if (error) {
      throw new Error(`getByIdIsland failed: ${JSON.stringify(error)}`);
    }
    
    return { data, error: null };
  }

  /**
   * Update island
   */
  async updateIsland(id: string, body: components['schemas']['UpdateIslandRequest']): Promise<{ data: unknown; error: null } | { data: null; error: Error }> {
    const { data, error } = await this.getClient().PUT('/api/islands/{id}', {
      params: {
        path: { id },
      },
      body,
    });
    
    if (error) {
      throw new Error(`updateIsland failed: ${JSON.stringify(error)}`);
    }
    
    return { data, error: null };
  }

  /**
   * Upload island photo
   */
  async uploadPhotoIsland(id: string, file: File): Promise<{ data: unknown; error: null } | { data: null; error: Error }> {
    const { data, error } = await this.getClient().POST('/api/islands/{id}/photo', {
      params: {
        path: { id },
      },
      body: (() => {
        const formData = new FormData();
        formData.append('photo', file);
        return formData as unknown as { photo: string };
      })(),
    });
    
    if (error) {
      throw new Error(`uploadPhotoIsland failed: ${JSON.stringify(error)}`);
    }
    
    return { data, error: null };
  }

}

// Export singleton instance
export const islandsService = new IslandsService();
