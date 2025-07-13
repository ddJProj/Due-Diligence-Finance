/**
 * Authentication-related type definitions.
 * These types mirror the backend DTOs from com.ddfinance.backend.dto.auth
 */

/**
 * User roles matching backend Role enum
 */
export type Role = 'GUEST' | 'CLIENT' | 'EMPLOYEE' | 'ADMIN';

/**
 * Permissions matching backend Permissions enum
 */
export type Permission = 
  | 'READ_OWN_PORTFOLIO'
  | 'UPDATE_OWN_PROFILE'
  | 'CREATE_INVESTMENT'
  | 'UPDATE_INVESTMENT'
  | 'DELETE_INVESTMENT'
  | 'READ_ALL_CLIENTS'
  | 'UPDATE_CLIENT'
  | 'READ_ALL_USERS'
  | 'UPDATE_USER'
  | 'DELETE_USER'
  | 'SYSTEM_ADMIN';

/**
 * DTO for UserAccount entity.
 * Matches backend UserAccountDTO - password is never included for security
 */
export interface UserAccountDTO {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  permissions: Set<Permission>;
}

/**
 * Login request payload.
 * Matches backend AuthenticationRequest
 */
export interface AuthenticationRequest {
  email: string;
  password: string;
}

/**
 * Registration request payload.
 * Matches backend RegisterAuthRequest
 */
export interface RegisterAuthRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * JWT token refresh request.
 * Matches backend TokenRefreshRequest
 */
export interface TokenRefreshRequest {
  refreshToken: string;
}

/**
 * Authentication response with JWT tokens.
 * Matches backend AuthenticationResponse
 */
export interface AuthenticationResponse {
  token: string;
  refreshToken: string;
  type: string;
  user: UserAccountDTO;
}

/**
 * Logout request payload.
 * Matches backend LogoutRequest
 */
export interface LogoutRequest {
  token: string;
  refreshToken?: string;
}
