/**
 * Standardized authentication error types and messages
 */

export enum AuthErrorCode {
  // User errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_EXISTS = 'USER_EXISTS',
  MISSING_CREDENTIALS = 'MISSING_CREDENTIALS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  
  // System errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  PASSWORD_HASH_ERROR = 'PASSWORD_HASH_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  
  // OAuth errors
  OAUTH_ERROR = 'OAUTH_ERROR',
  OAUTH_CALLBACK_ERROR = 'OAUTH_CALLBACK_ERROR',
  OAUTH_SESSION_ERROR = 'OAUTH_SESSION_ERROR',
}

/**
 * Interface for auth error details
 */
export interface AuthErrorDetails {
  code: AuthErrorCode;
  message: string;
  status: number;
}

/**
 * Map of error codes to error details
 */
export const AUTH_ERRORS: Record<AuthErrorCode, AuthErrorDetails> = {
  [AuthErrorCode.INVALID_CREDENTIALS]: {
    code: AuthErrorCode.INVALID_CREDENTIALS,
    message: 'Invalid email or password',
    status: 401,
  },
  [AuthErrorCode.USER_NOT_FOUND]: {
    code: AuthErrorCode.USER_NOT_FOUND,
    message: 'User not found',
    status: 404,
  },
  [AuthErrorCode.USER_EXISTS]: {
    code: AuthErrorCode.USER_EXISTS,
    message: 'User with this email already exists',
    status: 409,
  },
  [AuthErrorCode.MISSING_CREDENTIALS]: {
    code: AuthErrorCode.MISSING_CREDENTIALS,
    message: 'Email and password are required',
    status: 400,
  },
  [AuthErrorCode.UNAUTHORIZED]: {
    code: AuthErrorCode.UNAUTHORIZED,
    message: 'You must be logged in to access this resource',
    status: 401,
  },
  [AuthErrorCode.FORBIDDEN]: {
    code: AuthErrorCode.FORBIDDEN,
    message: 'You do not have permission to access this resource',
    status: 403,
  },
  [AuthErrorCode.DATABASE_ERROR]: {
    code: AuthErrorCode.DATABASE_ERROR,
    message: 'Database error occurred',
    status: 500,
  },
  [AuthErrorCode.PASSWORD_HASH_ERROR]: {
    code: AuthErrorCode.PASSWORD_HASH_ERROR,
    message: 'Error processing password',
    status: 500,
  },
  [AuthErrorCode.SERVER_ERROR]: {
    code: AuthErrorCode.SERVER_ERROR,
    message: 'Server error occurred',
    status: 500,
  },
  [AuthErrorCode.OAUTH_ERROR]: {
    code: AuthErrorCode.OAUTH_ERROR,
    message: 'OAuth authentication error',
    status: 500,
  },
  [AuthErrorCode.OAUTH_CALLBACK_ERROR]: {
    code: AuthErrorCode.OAUTH_CALLBACK_ERROR,
    message: 'OAuth callback error',
    status: 500,
  },
  [AuthErrorCode.OAUTH_SESSION_ERROR]: {
    code: AuthErrorCode.OAUTH_SESSION_ERROR,
    message: 'OAuth session error',
    status: 500,
  },
};

/**
 * Get error details for an error code
 * @param code Auth error code
 * @param customMessage Optional custom message to override default
 * @returns Error details
 */
export function getAuthError(code: AuthErrorCode, customMessage?: string): AuthErrorDetails {
  const error = AUTH_ERRORS[code];
  
  return {
    ...error,
    message: customMessage || error.message,
  };
}

/**
 * Create a customized auth error
 * @param code Auth error code
 * @param customMessage Optional custom message
 * @param customStatus Optional custom status code
 * @returns Customized error details
 */
export function createAuthError(
  code: AuthErrorCode,
  customMessage?: string,
  customStatus?: number
): AuthErrorDetails {
  const baseError = AUTH_ERRORS[code];
  
  return {
    code: baseError.code,
    message: customMessage || baseError.message,
    status: customStatus || baseError.status,
  };
}
