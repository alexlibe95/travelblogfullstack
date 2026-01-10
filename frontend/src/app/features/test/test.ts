import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  authenticationService, 
  healthService, 
  islandsService, 
  apiService, 
  searchService 
} from '../../../lib/api/services';
import type { components } from '../../../lib/api/types';

type LoginResponse = components['schemas']['LoginResponse'];
type IslandListResponse = components['schemas']['IslandListResponse'];
type IslandDetailResponse = components['schemas']['IslandDetailResponse'];
type UpdateIslandRequest = components['schemas']['UpdateIslandRequest'];
type SearchResponse = components['schemas']['SearchResponse'];

@Component({
  selector: 'app-test',
  imports: [CommonModule, FormsModule],
  templateUrl: './test.html',
  styleUrl: './test.css',
})
export class Test implements OnInit {
  // State signals
  protected readonly sessionToken = signal<string | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly islands = signal<IslandListResponse['data']>([]);
  protected readonly selectedIsland = signal<IslandDetailResponse['data'] | null>(null);
  protected readonly searchResults = signal<SearchResponse['data']>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected readonly healthStatus = signal<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected readonly rootInfo = signal<any>(null);

  // Form inputs
  protected loginUsername = '';
  protected loginPassword = '';
  protected searchQuery = '';
  protected islandId = '';
  protected updateName = '';
  protected updateDescription = '';

  /**
   * 1. Health Check - GET /health
   * Public endpoint to check server health
   */
  async checkHealth(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const result = await healthService.checkHealth();
      
      if (result.error) {
        this.error.set(`Health check failed: ${result.error.message}`);
        return;
      }
      
      if (result.data) {
        this.healthStatus.set(result.data);
        console.log('✅ Health check successful:', result.data);
      }
    } catch (err) {
      this.error.set(`Health check error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * 2. Root Endpoint - GET /
   * Get server information and available endpoints
   */
  async getRootInfo(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const result = await apiService.getRootInfo();
      
      if (result.error) {
        this.error.set(`Root endpoint error: ${result.error.message}`);
        return;
      }
      
      if (result.data) {
        this.rootInfo.set(result.data);
        console.log('✅ Root info:', result.data);
      }
    } catch (err) {
      this.error.set(`Root endpoint error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * 3. Login - POST /api/auth/login
   * Authenticate user and get session token
   */
  async login(): Promise<void> {
    if (!this.loginUsername || !this.loginPassword) {
      this.error.set('Username and password are required');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const result = await authenticationService.login({
        username: this.loginUsername,
        password: this.loginPassword,
      });
      
      if (result.error) {
        this.error.set(`Login failed: ${result.error.message}`);
        return;
      }
      
      if (result.data && typeof result.data === 'object' && result.data !== null && 'sessionToken' in result.data) {
        const loginData = result.data as LoginResponse;
        const token = loginData.sessionToken || null;
        this.sessionToken.set(token);
        
        // Set auth token on all services that need it
        if (token) {
          authenticationService.setAuthToken(token);
          islandsService.setAuthToken(token);
        }
        
        console.log('✅ Login successful:', loginData.user);
      }
    } catch (err) {
      this.error.set(`Login error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * 4. Logout - POST /api/auth/logout
   * Logout user (requires authentication)
   */
  async logout(): Promise<void> {
    const token = this.sessionToken();
    if (!token) {
      this.error.set('Not logged in');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const result = await authenticationService.logout();
      
      if (result.error) {
        this.error.set(`Logout failed: ${result.error.message}`);
        return;
      }
      
      if (result.data) {
        console.log('✅ Logout successful');
        this.sessionToken.set(null);
        
        // Clear auth tokens from all services
        authenticationService.clearAuthToken();
        islandsService.clearAuthToken();
      }
    } catch (err) {
      this.error.set(`Logout error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * 5. Get All Islands - GET /api/islands
   * Public endpoint to get list of all islands
   */
  async getAllIslands(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const result = await islandsService.getAllIsland();
      
      if (result.error) {
        this.error.set(`Failed to fetch islands: ${result.error.message}`);
        return;
      }
      
      if (result.data && typeof result.data === 'object' && result.data !== null && 'data' in result.data) {
        const islandsData = result.data as IslandListResponse;
        this.islands.set(islandsData.data || []);
        console.log(`✅ Fetched ${islandsData.data?.length || 0} islands`);
      }
    } catch (err) {
      this.error.set(`Get islands error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * 6. Get Island by ID - GET /api/islands/{id}
   * Public endpoint to get detailed island information
   */
  async getIslandById(): Promise<void> {
    if (!this.islandId.trim()) {
      this.error.set('Island ID is required');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const result = await islandsService.getByIdIsland(this.islandId);
      
      if (result.error) {
        this.error.set(`Failed to fetch island: ${result.error.message}`);
        return;
      }
      
      if (result.data && typeof result.data === 'object' && result.data !== null && 'data' in result.data) {
        const islandData = result.data as IslandDetailResponse;
        this.selectedIsland.set(islandData.data || null);
        console.log('✅ Island fetched:', islandData.data?.name);
      }
    } catch (err) {
      this.error.set(`Get island error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * 7. Update Island - PUT /api/islands/{id}
   * Update island information (admin only, requires authentication)
   */
  async updateIsland(): Promise<void> {
    const token = this.sessionToken();
    if (!token) {
      this.error.set('Authentication required');
      return;
    }

    if (!this.islandId.trim()) {
      this.error.set('Island ID is required');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const updates: UpdateIslandRequest = {};
      
      if (this.updateName) {
        updates.name = this.updateName;
      }
      if (this.updateDescription) {
        updates.description = this.updateDescription;
      }

      if (Object.keys(updates).length === 0) {
        this.error.set('At least one field must be provided for update');
        this.isLoading.set(false);
        return;
      }

      const result = await islandsService.updateIsland(this.islandId, updates);
      
      if (result.error) {
        this.error.set(`Failed to update island: ${result.error.message}`);
        return;
      }
      
      if (result.data) {
        console.log('✅ Island updated successfully');
        // Refresh the island data
        await this.getIslandById();
      }
    } catch (err) {
      this.error.set(`Update island error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * 8. Upload Island Photo - POST /api/islands/{id}/photo
   * Upload a photo for an island (admin only, requires authentication)
   */
  async uploadIslandPhoto(event: Event): Promise<void> {
    const token = this.sessionToken();
    if (!token) {
      this.error.set('Authentication required');
      return;
    }

    if (!this.islandId.trim()) {
      this.error.set('Island ID is required');
      return;
    }

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.error.set('Please select a file');
      return;
    }

    const photoFile = input.files[0];
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const result = await islandsService.uploadPhotoIsland(this.islandId, photoFile);
      
      if (result.error) {
        this.error.set(`Failed to upload photo: ${result.error.message}`);
        return;
      }
      
      if (result.data && typeof result.data === 'object' && result.data !== null && 'photoUrl' in result.data) {
        console.log('✅ Photo uploaded:', (result.data as { photoUrl?: string }).photoUrl);
        // Refresh the island data to see the new photo
        await this.getIslandById();
      }
    } catch (err) {
      this.error.set(`Upload photo error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * 9. Search Islands - GET /api/search?q={query}
   * Search islands by name, short description, or full description
   */
  async searchIslands(): Promise<void> {
    if (!this.searchQuery.trim()) {
      this.error.set('Search query is required');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const result = await searchService.searchIslands({ q: this.searchQuery });
      
      if (result.error) {
        this.error.set(`Search failed: ${result.error.message}`);
        return;
      }
      
      if (result.data && typeof result.data === 'object' && result.data !== null && 'data' in result.data) {
        const searchData = result.data as SearchResponse;
        this.searchResults.set(searchData.data || []);
        console.log(`✅ Found ${searchData.count || 0} results for "${this.searchQuery}"`);
      }
    } catch (err) {
      this.error.set(`Search error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Initialize component - load islands on startup
   */
  async ngOnInit(): Promise<void> {
    // Example: Check health and load islands on component init
    await this.checkHealth();
    await this.getAllIslands();
  }
}
