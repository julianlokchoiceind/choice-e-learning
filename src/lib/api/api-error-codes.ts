/**
 * Standardized API error codes
 * Provides a consistent set of error codes for API responses
 */

/**
 * API error codes
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
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED'
}

/**
 * Map API error codes to HTTP status codes
 */
export const errorCodeToStatusMap: Record<ApiErrorCode, number> = {
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
  [ApiErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ApiErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ApiErrorCode.NOT_IMPLEMENTED]: 501
};

/**
 * Get default error message for an error code
 * @param code API error code
 * @returns Default error message
 */
export function getDefaultErrorMessage(code: ApiErrorCode): string {
  switch (code) {
    // General errors
    case ApiErrorCode.UNKNOWN_ERROR:
      return 'An unknown error occurred';
    case ApiErrorCode.VALIDATION_ERROR:
      return 'Validation failed';
    case ApiErrorCode.NOT_FOUND:
      return 'Resource not found';
    case ApiErrorCode.METHOD_NOT_ALLOWED:
      return 'Method not allowed';
    case ApiErrorCode.CONFLICT:
      return 'Resource conflict';
    case ApiErrorCode.REQUEST_TIMEOUT:
      return 'Request timed out';
    case ApiErrorCode.REQUEST_PARSE_ERROR:
      return 'Failed to parse request';
    case ApiErrorCode.JSON_PARSE_ERROR:
      return 'Invalid JSON format';
    case ApiErrorCode.RATE_LIMIT_EXCEEDED:
      return 'Rate limit exceeded';
    
    // Authentication errors
    case ApiErrorCode.UNAUTHORIZED:
      return 'You must be logged in to access this resource';
    case ApiErrorCode.FORBIDDEN:
      return 'You do not have permission to access this resource';
    case ApiErrorCode.INVALID_CREDENTIALS:
      return 'Invalid email or password';
    case ApiErrorCode.INVALID_TOKEN:
      return 'Invalid authentication token';
    case ApiErrorCode.TOKEN_EXPIRED:
      return 'Authentication token has expired';
    case ApiErrorCode.MISSING_TOKEN:
      return 'Authentication token is required';
    case ApiErrorCode.SESSION_EXPIRED:
      return 'Your session has expired, please log in again';
    
    // User errors
    case ApiErrorCode.USER_NOT_FOUND:
      return 'User not found';
    case ApiErrorCode.USER_EXISTS:
      return 'User already exists';
    case ApiErrorCode.INVALID_USER_ROLE:
      return 'Invalid user role';
    case ApiErrorCode.USER_UPDATE_FAILED:
      return 'Failed to update user';
    case ApiErrorCode.USER_CREATE_FAILED:
      return 'Failed to create user';
    case ApiErrorCode.USER_DELETE_FAILED:
      return 'Failed to delete user';
    case ApiErrorCode.INVALID_PASSWORD:
      return 'Invalid password';
    case ApiErrorCode.PASSWORD_MISMATCH:
      return 'Passwords do not match';
    case ApiErrorCode.EMAIL_EXISTS:
      return 'Email already in use';
    
    // Course errors
    case ApiErrorCode.COURSE_NOT_FOUND:
      return 'Course not found';
    case ApiErrorCode.COURSE_EXISTS:
      return 'Course already exists';
    case ApiErrorCode.COURSE_CREATE_FAILED:
      return 'Failed to create course';
    case ApiErrorCode.COURSE_UPDATE_FAILED:
      return 'Failed to update course';
    case ApiErrorCode.COURSE_DELETE_FAILED:
      return 'Failed to delete course';
    case ApiErrorCode.LESSON_NOT_FOUND:
      return 'Lesson not found';
    case ApiErrorCode.MODULE_NOT_FOUND:
      return 'Module not found';
    
    // Enrollment errors
    case ApiErrorCode.ENROLLMENT_EXISTS:
      return 'You are already enrolled in this course';
    case ApiErrorCode.ENROLLMENT_NOT_FOUND:
      return 'Enrollment not found';
    case ApiErrorCode.ENROLLMENT_FAILED:
      return 'Failed to enroll in course';
    case ApiErrorCode.UNENROLLMENT_FAILED:
      return 'Failed to unenroll from course';
    case ApiErrorCode.COURSE_LOCKED:
      return 'This course is locked';
    case ApiErrorCode.PREREQUISITES_NOT_MET:
      return 'Course prerequisites not met';
    
    // Progress errors
    case ApiErrorCode.PROGRESS_NOT_FOUND:
      return 'Progress record not found';
    case ApiErrorCode.PROGRESS_UPDATE_FAILED:
      return 'Failed to update progress';
    case ApiErrorCode.INVALID_PROGRESS:
      return 'Invalid progress data';
    
    // Achievement errors
    case ApiErrorCode.ACHIEVEMENT_NOT_FOUND:
      return 'Achievement not found';
    case ApiErrorCode.ACHIEVEMENT_ALREADY_EARNED:
      return 'Achievement already earned';
    case ApiErrorCode.ACHIEVEMENT_CONDITIONS_NOT_MET:
      return 'Achievement conditions not met';
    
    // File/upload errors
    case ApiErrorCode.FILE_UPLOAD_FAILED:
      return 'Failed to upload file';
    case ApiErrorCode.FILE_NOT_FOUND:
      return 'File not found';
    case ApiErrorCode.INVALID_FILE_TYPE:
      return 'Invalid file type';
    case ApiErrorCode.FILE_TOO_LARGE:
      return 'File is too large';
    
    // Database errors
    case ApiErrorCode.DATABASE_ERROR:
      return 'Database error occurred';
    case ApiErrorCode.TRANSACTION_FAILED:
      return 'Database transaction failed';
    case ApiErrorCode.QUERY_FAILED:
      return 'Database query failed';
    case ApiErrorCode.DUPLICATE_ENTRY:
      return 'Duplicate database entry';
    case ApiErrorCode.FOREIGN_KEY_VIOLATION:
      return 'Foreign key constraint violation';
    
    // Server errors
    case ApiErrorCode.SERVER_ERROR:
      return 'Server error occurred';
    case ApiErrorCode.SERVICE_UNAVAILABLE:
      return 'Service is currently unavailable';
    case ApiErrorCode.EXTERNAL_SERVICE_ERROR:
      return 'External service error';
    case ApiErrorCode.NOT_IMPLEMENTED:
      return 'This feature is not implemented yet';
    
    default:
      return 'An unexpected error occurred';
  }
}

/**
 * Create a standardized API error
 * @param code API error code
 * @param message Custom error message (optional)
 * @param details Error details (optional)
 * @returns Error object with code, message, and status
 */
export function createApiError(
  code: ApiErrorCode,
  message?: string,
  details?: any
) {
  return {
    code,
    message: message || getDefaultErrorMessage(code),
    status: errorCodeToStatusMap[code],
    details
  };
}

/**
 * Convert an unknown error to a standardized API error
 * @param error Unknown error
 * @returns Standardized API error
 */
export function normalizeError(error: unknown) {
  if (typeof error === 'string') {
    return createApiError(ApiErrorCode.UNKNOWN_ERROR, error);
  }
  
  if (error instanceof Error) {
    // Check for known error types
    if ((error as any).code === 'P2025') {
      return createApiError(ApiErrorCode.NOT_FOUND, error.message);
    }
    
    if ((error as any).code === 'P2002') {
      return createApiError(ApiErrorCode.DUPLICATE_ENTRY, error.message);
    }
    
    if ((error as any).code === 'P2003') {
      return createApiError(ApiErrorCode.FOREIGN_KEY_VIOLATION, error.message);
    }
    
    // Generic error
    return createApiError(
      ApiErrorCode.UNKNOWN_ERROR,
      error.message,
      process.env.NODE_ENV === 'development' ? error.stack : undefined
    );
  }
  
  // Default case
  return createApiError(
    ApiErrorCode.UNKNOWN_ERROR,
    'An unexpected error occurred',
    process.env.NODE_ENV === 'development' ? error : undefined
  );
}
