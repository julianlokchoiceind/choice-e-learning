/**
 * @file Role definitions for user authentication and authorization
 * @description Centralized definition of roles used throughout the application
 */

/**
 * User roles in the system
 * @enum {string}
 */
export enum Role {
  student = 'student',
  instructor = 'instructor',
  admin = 'admin'
}
