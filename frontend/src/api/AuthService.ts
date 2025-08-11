// frontend/src/api/AuthService.ts

import { apiClient, setAuthToken, clearAuthToken } from './apiClient';
import {
  AuthenticationRequest,
  RegisterAuthRequest,
  AuthenticationResponse,
  RefreshTokenRequest,
  LogoutRequest,
  UserAccountDTO,
} from '@/types';

/**
 * Authentication service for handling login, registration, and token management.
 * Implements singleton pattern to ensure consistent state across the application.
 */
export class AuthService {
  private static instance: AuthService;
  private currentUser: UserAccountDTO | null = null;
  private authResponse: AuthenticationResponse | null = null;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance of AuthService
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login with email and password
   * @param credentials - User login credentials
   * @returns Authentication response with token and user info
   */
  public async login(credentials: AuthenticationRequest): Promise<AuthenticationResponse> {
    const response = await apiClient.post<AuthenticationResponse>('/auth/login', credentials);
    const authData = response.data;

    // Store auth data and set token
    this.authResponse = authData;
    this.currentUser = authData.user;
    setAuthToken(authData.token);

    // Store refresh token in localStorage for persistence
    if (authData.refreshToken) {
      localStorage.setItem('refreshToken', authData.refreshToken);
    }

    return authData;
  }

  /**
   * Register a new user account
   * @param registrationData - New user registration data
   * @returns Authentication response with token and user info
   */
  public async register(registrationData: RegisterAuthRequest): Promise<AuthenticationResponse> {
    const response = await apiClient.post<AuthenticationResponse>('/auth/register', registrationData);
    const authData = response.data;

    // Store auth data and set token
    this.authResponse = authData;
    this.currentUser = authData.user;
    setAuthToken(authData.token);

    // Store refresh token
    if (authData.refreshToken) {
      localStorage.setItem('refreshToken', authData.refreshToken);
    }

    return authData;
  }

  /**
   * Logout the current user
   * @param logoutData - Optional logout data with refresh token
   */
  public async logout(logoutData?: LogoutRequest): Promise<void> {
    try {
      // If no logout data provided, try to get refresh token from storage
      const refreshToken = logoutData?.refreshToken || localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      // Log error but don't throw - we still want to clear local state
      console.error('Logout request failed:', error);
    } finally {
      // Always clear local auth state
      this.clearAuthState();
    }
  }

  /**
   * Refresh the authentication token
   * @param refreshData - Refresh token request data
   * @returns New authentication response
   */
  public async refreshToken(refreshData: RefreshTokenRequest): Promise<AuthenticationResponse> {
    try {
      const response = await apiClient.post<AuthenticationResponse>('/auth/refresh', refreshData);
      const authData = response.data;

      // Update auth data and token
      this.authResponse = authData;
      this.currentUser = authData.user;
      setAuthToken(authData.token);

      // Update stored refresh token
      if (authData.refreshToken) {
        localStorage.setItem('refreshToken', authData.refreshToken);
      }

      return authData;
    } catch (error) {
      // Clear auth state on refresh failure (401)
      if ((error as any)?.response?.status === 401) {
        this.clearAuthState();
      }
      throw error;
    }
  }

  /**
   * Get the current authenticated user
   * @returns Current user or null if not authenticated
   */
  public getCurrentUser(): UserAccountDTO | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   * @returns True if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Get the current auth response (includes token info)
   * @returns Current auth response or null
   */
  public getAuthResponse(): AuthenticationResponse | null {
    return this.authResponse;
  }

  /**
   * Clear all authentication state
   */
  private clearAuthState(): void {
    this.currentUser = null;
    this.authResponse = null;
    clearAuthToken();
    localStorage.removeItem('refreshToken');
  }

  /**
   * Attempt to restore authentication from stored tokens
   * @returns True if auth was restored, false otherwise
   */
  public async restoreAuth(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      return false;
    }

    try {
      await this.refreshToken({ refreshToken });
      return true;
    } catch (error) {
      console.error('Failed to restore auth:', error);
      this.clearAuthState();
      return false;
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
