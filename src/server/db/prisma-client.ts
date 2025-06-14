import { PrismaClient } from '@prisma/client';

// Maximum number of retries for database operations
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 200;

// Prevent multiple instances of Prisma Client in development
declare global {
  // Using 'var' is required here for Next.js global declarations
  // This is an exception to our ESLint rules
  /* eslint-disable no-var */
  var prisma: PrismaClient | undefined;
  /* eslint-enable no-var */
}

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Create a singleton Prisma Client instance
function createPrismaClient(): PrismaClient {
  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
    
    // Add middleware for error handling and retry logic
    // Client.$extends is used here for query middleware
    client.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query, operation }) {
            let retries = 0;
            
            while (true) {
              try {
                return await query(args);
              } catch (error: unknown) {
                // Log the error
                console.error(`Prisma Client Error in operation: ${operation}:`, error);
                
                // Check if we should retry
                if (retries < MAX_RETRIES && isPrismaRetryableError(error)) {
                  retries++;
                  console.log(`Retrying operation (attempt ${retries}/${MAX_RETRIES})...`);
                  
                  // Add exponential backoff
                  await delay(RETRY_DELAY_MS * Math.pow(2, retries - 1));
                  continue;
                }
                
                // If we reach here, we've exceeded retries or error is not retryable
                throw error;
              }
            }
          }
        }
      }
    });
    
    // Keep old approach for backward compatibility, will be removed in future updates
    // The $use method is deprecated in newer Prisma versions but we still need it for compatibility
    client.$use(async (params, next) => {
      let retries = 0;
      
      while (true) {
        try {
          return await next(params);
        } catch (error: unknown) {
          // Log the error
          console.error(`Prisma Client Error in ${params.model}.${params.action}:`, error);
          
          // Check if we should retry
          if (retries < MAX_RETRIES && isPrismaRetryableError(error)) {
            retries++;
            console.log(`Retrying operation (attempt ${retries}/${MAX_RETRIES})...`);
            
            // Add exponential backoff
            await delay(RETRY_DELAY_MS * Math.pow(2, retries - 1));
            continue;
          }
          
          // If we reach here, we've exceeded retries or error is not retryable
          throw error;
        }
      }
    });
    
    // Test connection and log success
    client.$connect()
      .then(() => {
        console.log('Database connection established successfully');
        // No need to call bootstrap here as it will be handled by a separate import
      })
      .catch((e) => console.error('Failed to connect to database:', e));
    
    return client;
  } catch (e: unknown) {
    console.error('Error creating Prisma client:', e);
    throw e;
  }
}

// Check if an error is retryable
function isPrismaRetryableError(error: any): boolean {
  // Network errors
  if (error.code === 'P1001' || error.code === 'P1002') return true;
  
  // Connection errors
  if (error.code === 'P1008' || error.code === 'P1011') return true;
  
  // Timeout errors
  if (error.code === 'P1009') return true;
  
  // MongoDB transient errors
  if (error.message?.includes('MongoNetworkError')) return true;
  if (error.message?.includes('MongoServerSelectionError')) return true;
  
  return false;
}

// Ensure we only create the client once
let prismaInstance: PrismaClient;

try {
  if (process.env.NODE_ENV === 'production') {
    prismaInstance = createPrismaClient();
  } else {
    // Use global in development to avoid duplicates during hot reloading
    if (!global.prisma) {
      global.prisma = createPrismaClient();
    }
    prismaInstance = global.prisma;
  }
} catch (error: unknown) {
  console.error('Failed to initialize Prisma client:', error);
  throw error;
}

export default prismaInstance;
