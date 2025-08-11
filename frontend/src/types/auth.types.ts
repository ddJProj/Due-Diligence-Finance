// frontend/src/types/auth.types.ts

import { Role } from './common.types';

export interface AuthenticationRequest {
  email: string;
  password: string;
}

export interface RegisterAuthRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthenticationResponse {
  token: string;
  refreshToken: string;
  user: AuthenticatedUser;
  expiresIn: number;
}

export interface AuthenticatedUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  active: boolean;
  createdAt: string;
  lastLogin: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  token: string;
  refreshToken: string;
}
