/**
 * Centralized error handling for API responses
 * Combines functionality from api-error-codes.ts and api-errors.ts
 */

/**
 * Enum of possible API error codes
 * Categorized by domain and error type
 */
export enum ApiErrorCode {
  // General errors (1000-1999)
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  CONFLICT = 'CONFLICT',
  REQUEST_TIMEOUT = 'REQUEST_TIMEOUT',
  REQUEST_PARSE_ERROR = 'REQUEST_PARSE_ERROR',
  JSON_PARSE_ERROR = 'JSON_PARSE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  BAD_REQUEST = 'BAD_REQUEST',
  
  // Authentication errors (2000-2999)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  MISSING_TOKEN = 'MISSING_TOKEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // User errors (3000-3999)
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_EXISTS = 'USER_EXISTS',
  INVALID_USER_ROLE = 'INVALID_USER_ROLE',
  USER_UPDATE_FAILED = 'USER_UPDATE_FAILED',
  USER_CREATE_FAILED = 'USER_CREATE_FAILED',
  USER_DELETE_FAILED = 'USER_DELETE_FAILED',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  
  // Course errors (4000-4999)
  COURSE_NOT_FOUND = 'COURSE_NOT_FOUND',
  COURSE_EXISTS = 'COURSE_EXISTS',
  COURSE_CREATE_FAILED = 'COURSE_CREATE_FAILED',
  COURSE_UPDATE_FAILED = 'COURSE_UPDATE_FAILED',
  COURSE_DELETE_FAILED = 'COURSE_DELETE_FAILED',
  LESSON_NOT_FOUND = 'LESSON_NOT_FOUND',
  MODULE_NOT_FOUND = 'MODULE_NOT_FOUND',
  
  // Enrollment errors (5000-5999)
  ENROLLMENT_EXISTS = 'ENROLLMENT_EXISTS',
  ENROLLMENT_NOT_FOUND = 'ENROLLMENT_NOT_FOUND',
  ENROLLMENT_FAILED = 'ENROLLMENT_FAILED',
  UNENROLLMENT_FAILED = 'UNENROLLMENT_FAILED',
  COURSE_LOCKED = 'COURSE_LOCKED',
  PREREQUISITES_NOT_MET = 'PREREQUISITES_NOT_MET',
  
  // Progress errors (6000-6999)
  PROGRESS_NOT_FOUND = 'PROGRESS_NOT_FOUND',
  PROGRESS_UPDATE_FAILED = 'PROGRESS_UPDATE_FAILED',
  INVALID_PROGRESS = 'INVALID_PROGRESS',
  
  // Achievement errors (7000-7999)
  ACHIEVEMENT_NOT_FOUND = 'ACHIEVEMENT_NOT_FOUND',
  ACHIEVEMENT_ALREADY_EARNED = 'ACHIEVEMENT_ALREADY_EARNED',
  ACHIEVEMENT_CONDITIONS_NOT_MET = 'ACHIEVEMENT_CONDITIONS_NOT_MET',
  
  // File/upload errors (8000-8999)
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  
  // Database errors (9000-9999)
  DATABASE_ERROR = 'DATABASE_ERROR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  QUERY_FAILED = 'QUERY_FAILED',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  FOREIGN_KEY_VIOLATION = 'FOREIGN_KEY_VIOLATION',
  
  // Server errors (10000-10999)
  SERVER_ERROR = 'SERVER_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR', // Alias for SERVER_ERROR for backward compatibility
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED'
}

/**
 * Map API error codes to HTTP status codes
 */
export const HTTP_STATUS_MAP: Record<ApiErrorCode, number> = {
  // General errors
  [ApiErrorCode.UNKNOWN_ERROR]: 500,
  [ApiErrorCode.VALIDATION_ERROR]: 400,
  [ApiErrorCode.NOT_FOUND]: 404,
  [ApiErrorCode.METHOD_NOT_ALLOWED]: 405,
  [ApiErrorCode.CONFLICT]: 409,
  [ApiErrorCode.REQUEST_TIMEOUT]: 408,
  [ApiErrorCode.REQUEST_PARSE_ERROR]: 400,
  [ApiErrorCode.JSON_PARSE_ERROR]: 400,
  [ApiErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ApiErrorCode.BAD_REQUEST]: 400,
  
  // Authentication errors
  [ApiErrorCode.UNAUTHORIZED]: 401,
  [ApiErrorCode.FORBIDDEN]: 403,
  [ApiErrorCode.INVALID_CREDENTIALS]: 401,
  [ApiErrorCode.INVALID_TOKEN]: 401,
  [ApiErrorCode.TOKEN_EXPIRED]: 401,
  [ApiErrorCode.MISSING_TOKEN]: 401,
  [ApiErrorCode.SESSION_EXPIRED]: 401,
  
  // User errors
  [ApiErrorCode.USER_NOT_FOUND]: 404,
  [ApiErrorCode.USER_EXISTS]: 409,
  [ApiErrorCode.INVALID_USER_ROLE]: 400,
  [ApiErrorCode.USER_UPDATE_FAILED]: 500,
  [ApiErrorCode.USER_CREATE_FAILED]: 500,
  [ApiErrorCode.USER_DELETE_FAILED]: 500,
  [ApiErrorCode.INVALID_PASSWORD]: 400,
  [ApiErrorCode.PASSWORD_MISMATCH]: 400,
  [ApiErrorCode.EMAIL_EXISTS]: 409,
  
  // Course errors
  [ApiErrorCode.COURSE_NOT_FOUND]: 404,
  [ApiErrorCode.COURSE_EXISTS]: 409,
  [ApiErrorCode.COURSE_CREATE_FAILED]: 500,
  [ApiErrorCode.COURSE_UPDATE_FAILED]: 500,
  [ApiErrorCode.COURSE_DELETE_FAILED]: 500,
  [ApiErrorCode.LESSON_NOT_FOUND]: 404,
  [ApiErrorCode.MODULE_NOT_FOUND]: 404,
  
  // Enrollment errors
  [ApiErrorCode.ENROLLMENT_EXISTS]: 409,
  [ApiErrorCode.ENROLLMENT_NOT_FOUND]: 404,
  [ApiErrorCode.ENROLLMENT_FAILED]: 500,
  [ApiErrorCode.UNENROLLMENT_FAILED]: 500,
  [ApiErrorCode.COURSE_LOCKED]: 403,
  [ApiErrorCode.PREREQUISITES_NOT_MET]: 400,
  
  // Progress errors
  [ApiErrorCode.PROGRESS_NOT_FOUND]: 404,
  [ApiErrorCode.PROGRESS_UPDATE_FAILED]: 500,
  [ApiErrorCode.INVALID_PROGRESS]: 400,
  
  // Achievement errors
  [ApiErrorCode.ACHIEVEMENT_NOT_FOUND]: 404,
  [ApiErrorCode.ACHIEVEMENT_ALREADY_EARNED]: 409,
  [ApiErrorCode.ACHIEVEMENT_CONDITIONS_NOT_MET]: 400,
  
  // File/upload errors
  [ApiErrorCode.FILE_UPLOAD_FAILED]: 500,
  [ApiErrorCode.FILE_NOT_FOUND]: 404,
  [ApiErrorCode.INVALID_FILE_TYPE]: 400,
  [ApiErrorCode.FILE_TOO_LARGE]: 413,
  
  // Database errors
  [ApiErrorCode.DATABASE_ERROR]: 500,
  [ApiErrorCode.TRANSACTION_FAILED]: 500,
  [ApiErrorCode.QUERY_FAILED]: 500,
  [ApiErrorCode.DUPLICATE_ENTRY]: 409,
  [ApiErrorCode.FOREIGN_KEY_VIOLATION]: 400,
  
  // Server errors
  [ApiErrorCode.SERVER_ERROR]: 500,
  [ApiErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ApiErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ApiErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ApiErrorCode.NOT_IMPLEMENTED]: 501
};

/**
 * Default error messages for API error codes
 */
export const DEFAULT_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  // General errors
  [ApiErrorCode.UNKNOWN_ERROR]: 'An unknown error occurred',
  [ApiErrorCode.VALIDATION_ERROR]: 'Validation failed',
  [ApiErrorCode.NOT_FOUND]: 'Resource not found',
  [ApiErrorCode.METHOD_NOT_ALLOWED]: 'Method not allowed',
  [ApiErrorCode.CONFLICT]: 'Resource conflict',
  [ApiErrorCode.REQUEST_TIMEOUT]: 'Request timed out',
  [ApiErrorCode.REQUEST_PARSE_ERROR]: 'Failed to parse request',
  [ApiErrorCode.JSON_PARSE_ERROR]: 'Invalid JSON format',
  [ApiErrorCode.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
  [ApiErrorCode.BAD_REQUEST]: 'Bad request',
  
  // Authentication errors
  [ApiErrorCode.UNAUTHORIZED]: 'You must be logged in to access this resource',
  [ApiErrorCode.FORBIDDEN]: 'You do not have permission to access this resource',
  [ApiErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password',
  [ApiErrorCode.INVALID_TOKEN]: 'Invalid authentication token',
  [ApiErrorCode.TOKEN_EXPIRED]: 'Authentication token has expired',
  [ApiErrorCode.MISSING_TOKEN]: 'Authentication token is required',
  [ApiErrorCode.SESSION_EXPIRED]: 'Your session has expired, please log in again',
  
  // User errors
  [ApiErrorCode.USER_NOT_FOUND]: 'User not found',
  [ApiErrorCode.USER_EXISTS]: 'User already exists',
  [ApiErrorCode.INVALID_USER_ROLE]: 'Invalid user role',
  [ApiErrorCode.USER_UPDATE_FAILED]: 'Failed to update user',
  [ApiErrorCode.USER_CREATE_FAILED]: 'Failed to create user',
  [ApiErrorCode.USER_DELETE_FAILED]: 'Failed to delete user',
  [ApiErrorCode.INVALID_PASSWORD]: 'Invalid password',
  [ApiErrorCode.PASSWORD_MISMATCH]: 'Passwords do not match',
  [ApiErrorCode.EMAIL_EXISTS]: 'Email already in use',
  
  // Course errors
  [ApiErrorCode.COURSE_NOT_FOUND]: 'Course not found',
  [ApiErrorCode.COURSE_EXISTS]: 'Course already exists',
  [ApiErrorCode.COURSE_CREATE_FAILED]: 'Failed to create course',
  [ApiErrorCode.COURSE_UPDATE_FAILED]: 'Failed to update course',
  [ApiErrorCode.COURSE_DELETE_FAILED]: 'Failed to delete course',
  [ApiErrorCode.LESSON_NOT_FOUND]: 'Lesson not found',
  [ApiErrorCode.MODULE_NOT_FOUND]: 'Module not found',
  
  // Enrollment errors
  [ApiErrorCode.ENROLLMENT_EXISTS]: 'You are already enrolled in this course',
  [ApiErrorCode.ENROLLMENT_NOT_FOUND]: 'Enrollment not found',
  [ApiErrorCode.ENROLLMENT_FAILED]: 'Failed to enroll in course',
  [ApiErrorCode.UNENROLLMENT_FAILED]: 'Failed to unenroll from course',
  [ApiErrorCode.COURSE_LOCKED]: 'This course is locked',
  [ApiErrorCode.PREREQUISITES_NOT_MET]: 'Course prerequisites not met',
  
  // Progress errors
  [ApiErrorCode.PROGRESS_NOT_FOUND]: 'Progress record not found',
  [ApiErrorCode.PROGRESS_UPDATE_FAILED]: 'Failed to update progress',
  [ApiErrorCode.INVALID_PROGRESS]: 'Invalid progress data',
  
  // Achievement errors
  [ApiErrorCode.ACHIEVEMENT_NOT_FOUND]: 'Achievement not found',
  [ApiErrorCode.ACHIEVEMENT_ALREADY_EARNED]: 'Achievement already earned',
  [ApiErrorCode.ACHIEVEMENT_CONDITIONS_NOT_MET]: 'Achievement conditions not met',
  
  // File/upload errors
  [ApiErrorCode.FILE_UPLOAD_FAILED]: 'Failed to upload file',
  [ApiErrorCode.FILE_NOT_FOUND]: 'File not found',
  [ApiErrorCode.INVALID_FILE_TYPE]: 'Invalid file type',
  [ApiErrorCode.FILE_TOO_LARGE]: 'File is too large',
  
  // Database errors
  [ApiErrorCode.DATABASE_ERROR]: 'Database error occurred',
  [ApiErrorCode.TRANSACTION_FAILED]: 'Database transaction failed',
  [ApiErrorCode.QUERY_FAILED]: 'Database query failed',
  [ApiErrorCode.DUPLICATE_ENTRY]: 'Duplicate database entry',
  [ApiErrorCode.FOREIGN_KEY_VIOLATION]: 'Foreign key constraint violation',
  
  // Server errors
  [ApiErrorCode.SERVER_ERROR]: 'Server error occurred',
  [ApiErrorCode.INTERNAL_SERVER_ERROR]: 'Internal server error',
  [ApiErrorCode.SERVICE_UNAVAILABLE]: 'Service is currently unavailable',
  [ApiErrorCode.EXTERNAL_SERVICE_ERROR]: 'External service error',
  [ApiErrorCode.NOT_IMPLEMENTED]: 'This feature is not implemented yet'
};

/**
 * Interface for structured error responses
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: any;
  };
}

/**
 * Custom error class for API errors with proper typing
 */
export class ApiError extends Error {
  code: ApiErrorCode;
  details?: any;
  status: number;

  constructor(code: ApiErrorCode, message?: string, details?: any) {
    super(message || DEFAULT_ERROR_MESSAGES[code]);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.status = HTTP_STATUS_MAP[code];
  }

  /**
   * Converts the error to a response object
   */
  toResponse(): ApiErrorResponse {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }

  /**
   * Helper to create a formatted error response
   */
  static createErrorResponse(code: ApiErrorCode, message?: string, details?: any): ApiErrorResponse {
    return {
      success: false,
      error: {
        code,
        message: message || DEFAULT_ERROR_MESSAGES[code],
        details,
      },
    };
  }

  /**
   * Handle various error types and convert to an API error
   */
  static fromError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    // Handle standard Error objects
    if (error instanceof Error) {
      // Check for Prisma errors
      if ((error as any).code === 'P2025') {
        return new ApiError(ApiErrorCode.NOT_FOUND, error.message);
      }
      
      if ((error as any).code === 'P2002') {
        return new ApiError(ApiErrorCode.DUPLICATE_ENTRY, error.message);
      }
      
      if ((error as any).code === 'P2003') {
        return new ApiError(ApiErrorCode.FOREIGN_KEY_VIOLATION, error.message);
      }
      
      return new ApiError(ApiErrorCode.SERVER_ERROR, error.message);
    }

    // Handle string errors
    if (typeof error === 'string') {
      return new ApiError(ApiErrorCode.SERVER_ERROR, error);
    }

    // Default fallback for unknown error types
    return new ApiError(
      ApiErrorCode.UNKNOWN_ERROR,
      'An unexpected error occurred',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }

  // Convenience methods for creating specific error types
  static badRequest(message?: string, details?: any): ApiError {
    return new ApiError(ApiErrorCode.BAD_REQUEST, message, details);
  }

  static unauthorized(message?: string, details?: any): ApiError {
    return new ApiError(ApiErrorCode.UNAUTHORIZED, message, details);
  }

  static forbidden(message?: string, details?: any): ApiError {
    return new ApiError(ApiErrorCode.FORBIDDEN, message, details);
  }

  static notFound(message?: string, details?: any): ApiError {
    return new ApiError(ApiErrorCode.NOT_FOUND, message, details);
  }

  static conflict(message?: string, details?: any): ApiError {
    return new ApiError(ApiErrorCode.CONFLICT, message, details);
  }

  static validationError(message?: string, details?: any): ApiError {
    return new ApiError(ApiErrorCode.VALIDATION_ERROR, message, details);
  }

  static serverError(message?: string, details?: any): ApiError {
    return new ApiError(ApiErrorCode.SERVER_ERROR, message, details);
  }
  
  // Additional methods for common error types
  static courseNotFound(message?: string, details?: any): ApiError {
    return new ApiError(ApiErrorCode.COURSE_NOT_FOUND, message, details);
  }
  
  static lessonNotFound(message?: string, details?: any): ApiError {
    return new ApiError(ApiErrorCode.LESSON_NOT_FOUND, message, details);
  }
  
  static userNotFound(message?: string, details?: any): ApiError {
    return new ApiError(ApiErrorCode.USER_NOT_FOUND, message, details);
  }
  
  static databaseError(message?: string, details?: any): ApiError {
    return new ApiError(ApiErrorCode.DATABASE_ERROR, message, details);
  }
}

/**
 * Export compatible functions from api-error-codes.ts for backward compatibility
 */
export function getDefaultErrorMessage(code: ApiErrorCode): string {
  return DEFAULT_ERROR_MESSAGES[code];
}

export function createApiError(code: ApiErrorCode, message?: string, details?: any) {
  return {
    code,
    message: message || DEFAULT_ERROR_MESSAGES[code],
    status: HTTP_STATUS_MAP[code],
    details
  };
}

export function normalizeError(error: unknown) {
  return ApiError.fromError(error);
}

// Export the error code to status map with the old name for compatibility
export const errorCodeToStatusMap = HTTP_STATUS_MAP;

export default ApiError;