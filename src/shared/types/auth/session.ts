/**
 * @file Session type definitions
 * @description Type definitions for auth session and JWT
 */

import { Role } from './roles';

/**
 * NextAuth session and JWT type extensions
 * These declarations augment the built-in NextAuth types
 */

/**
 * Extends built-in NextAuth User type
 */
export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
}

/**
 * Extends built-in NextAuth Session type
 */
export interface AuthSession {
  user: AuthUser;
  expires: string;
}

/**
 * Extends built-in NextAuth JWT type
 */
export interface AuthToken {
  id: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  role: Role;
  iat: number;
  exp: number;
  jti: string;
}

/**
 * Login request interface
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login response interface
 */
export interface LoginResponse {
  user: AuthUser;
  token: string;
}
