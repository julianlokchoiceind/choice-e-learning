"use server";

import { MongoClient } from 'mongodb';

// Connection URL
const url = process.env.MONGODB_URI || process.env.DATABASE_URL;
const dbName = process.env.MONGODB_DB;

// Connection cache
let client: MongoClient | null = null;

// Get MongoDB client (cached)
export async function getMongoClient() {
  if (!url) {
    throw new Error('MONGODB_URI or DATABASE_URL is not defined');
  }

  if (client) {
    return client;
  }

  client = await MongoClient.connect(url, {
    connectTimeoutMS: 10000,  // 10 seconds timeout for connection
    socketTimeoutMS: 45000,   // 45 seconds for socket operations
  });
  
  console.log('MongoDB client connected successfully');
  return client;
}

// Get database
export async function getDatabase() {
  // Use default database from connection string if dbName not specified
  const client = await getMongoClient();
  const db = client.db(dbName);
  return db;
}

// Get a collection
export async function getCollection(collectionName: string) {
  const db = await getDatabase();
  return db.collection(collectionName);
}

// Create user directly with MongoDB API
export async function createUserDirectly(userData: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  try {
    const usersCollection = await getCollection('users');
    
    // Check if email already exists
    const existingUser = await usersCollection.findOne({ email: userData.email });
    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }

    // Create document for new user
    const now = new Date();
    const result = await usersCollection.insertOne({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      createdAt: now,
      updatedAt: now,
    });
    
    if (result.acknowledged) {
      return {
        success: true,
        id: result.insertedId.toString(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: now
      };
    }
    
    return { 
      success: false, 
      error: 'Failed to insert user' 
    };
  } catch (error) {
    console.error('Error creating user directly:', error);
    return { 
      success: false, 
      error: (error as Error).message || 'Unknown error' 
    };
  }
}

// Test database connection
export async function testConnection() {
  try {
    console.log('Testing database connection...');
    const db = await getDatabase();
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`Database connection successful! Found ${userCount} users`);
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    console.error('Please ensure MongoDB is running and your connection string is correct');
    return false;
  }
}