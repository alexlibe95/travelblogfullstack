import { Injectable, signal } from '@angular/core';
import { STORAGE_KEYS } from '../../constants/storage';
import { authenticationService, islandsService } from '../../../lib/api/services';

/**
 * Authentication service for managing session tokens
 * Handles token persistence and service configuration
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Session token signal
  private readonly _sessionToken = signal<string | null>(null);

  /**
   * Read-only access to session token
   */
  get sessionToken() {
    return this._sessionToken.asReadonly();
  }

  /**
   * Check if user is authenticated
   */
  get isAuthenticated(): boolean {
    return this._sessionToken() !== null;
  }

  constructor() {
    // Load token from storage on service initialization
    this.loadTokenFromStorage();
  }

  /**
   * Load session token from localStorage and set it on services
   */
  private loadTokenFromStorage(): void {
    const storedToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    if (storedToken) {
      this.setToken(storedToken, false); // Don't save to storage again
    }
  }

  /**
   * Set session token and configure services
   * @param token - Session token to set
   * @param saveToStorage - Whether to save to localStorage (default: true)
   */
  setToken(token: string | null, saveToStorage = true): void {
    this._sessionToken.set(token);

    if (token) {
      // Set auth token on all services that need it
      authenticationService.setAuthToken(token);
      islandsService.setAuthToken(token);

      // Save to localStorage if requested
      if (saveToStorage) {
        localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
      }
    } else {
      // Clear auth tokens from all services
      authenticationService.clearAuthToken();
      islandsService.clearAuthToken();

      // Remove from localStorage if requested
      if (saveToStorage) {
        localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
      }
    }
  }

  /**
   * Clear session token and remove from storage
   */
  clearToken(): void {
    this.setToken(null, true);
  }

  /**
   * Get current session token
   */
  getToken(): string | null {
    return this._sessionToken();
  }
}
