/**
 * Database configuration for the application
 * This file contains environment-specific database configuration settings
 */

const databaseConfig = {
  /**
   * MongoDB connection string from environment variables
   */
  url: process.env.DATABASE_URL,
  
  /**
   * Maximum number of connections in the connection pool
   */
  connectionPoolSize: process.env.NODE_ENV === 'production' ? 10 : 5,
  
  /**
   * Connection timeout in milliseconds
   */
  connectionTimeout: 30000, // 30 seconds
  
  /**
   * Enable or disable query logging based on environment
   */
  enableLogging: process.env.NODE_ENV === 'development',
};

export default databaseConfig; 