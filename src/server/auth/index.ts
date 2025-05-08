// Auth session
export * from './auth-options';
export { 
  isAdmin,
  isAuthenticated,
  isStudent,
  checkUserRole
} from './session';

// Auth roles
export { hasPermission } from './roles';

// Auth errors
export type { AuthError } from './services';

export * from './middleware';
export * from './auth-middleware';
export * from './utils';
