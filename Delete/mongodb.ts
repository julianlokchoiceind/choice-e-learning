/**
 * MongoDB connection utilities
 * Provides direct access to MongoDB collections
 */

import { MongoClient, Collection, Db } from 'mongodb';

// Connection URI from environment variables
const uri = process.env.DATABASE_URL as string;

// Cache client connection to avoid multiple connections in dev mode
let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Get MongoDB client connection
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (client) {
    return client;
  }
  
  // Check if URI is available
  if (!uri) {
    throw new Error('MongoDB connection string is not defined in environment variables');
  }
  
  try {
    // Create a new client with retry mechanism
    client = new MongoClient(uri, {
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000,  // 45 seconds
    });
    
    // Connect to the client
    await client.connect();
    console.log('Connected to MongoDB');
    
    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

/**
 * Get MongoDB database
 */
export async function getDatabase(): Promise<Db> {
  if (db) {
    return db;
  }
  
  const client = await getMongoClient();
  
  // Extract database name from connection string or use default
  let dbName = 'choice-e-learning';
  
  // Try to extract from URI if present
  try {
    const uriObj = new URL(uri);
    const pathParts = uriObj.pathname.split('/');
    if (pathParts.length > 1 && pathParts[1]) {
      dbName = pathParts[1];
    }
  } catch (error) {
    console.warn('Could not parse database name from URI, using default:', dbName);
  }
  
  db = client.db(dbName);
  return db;
}

/**
 * Get a collection from the database
 * @param collectionName Name of the collection
 * @returns Collection object
 */
export async function getCollection<T = any>(collectionName: string): Promise<Collection<T>> {
  const db = await getDatabase();
  return db.collection<T>(collectionName);
}

/**
 * Close MongoDB connection
 * Useful for cleaning up after tests or when the application is shutting down
 */
export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}

// Register cleanup on process termination
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await closeConnection();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await closeConnection();
    process.exit(0);
  });
}
