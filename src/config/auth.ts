/**
 * Authentication configuration for the application
 * This file contains environment-specific authentication configuration settings
 */

const authConfig = {
  /**
   * Secret key for NextAuth.js
   */
  secret: process.env.NEXTAUTH_SECRET,
  
  /**
   * URL for NextAuth.js
   */
  url: process.env.NEXTAUTH_URL,
  
  /**
   * JWT token expiration time in seconds
   */
  tokenExpiration: 30 * 24 * 60 * 60, // 30 days
  
  /**
   * JWT issuer for token validation
   */
  issuer: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  
  /**
   * Cookie secure setting based on environment
   */
  secureCookie: process.env.NODE_ENV === 'production',
  
  /**
   * Password hashing rounds for bcrypt
   */
  passwordHashRounds: 10,
};

export default authConfig; 