/**
 * User registration API endpoint
 * Handles new user registration process
 */

import { NextRequest } from 'next/server';
import { registerUserSchema } from '@/utils/validation';
import { AuthService } from '@/lib/auth/services/auth-service';
import { 
  apiCreated, 
  apiError, 
  apiServerError 
} from '@/lib/api/api-response';
import { 
  validateRequest 
} from '@/lib/api/request-parser';
import { 
  withErrorHandling 
} from '@/lib/api/route-handlers';
import { 
  documentEndpoint 
} from '@/lib/api/api-docs';

// Document the API endpoint
documentEndpoint({
  path: '/api/auth/register',
  method: 'POST',
  description: 'Register a new user account',
  requiresAuth: false,
  requestBody: {
    contentType: 'application/json',
    schema: 'name: string, email: string, password: string, role?: string',
    example: {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securePassword123'
    }
  },
  responses: [
    {
      status: 201,
      description: 'User registered successfully',
      example: {
        success: true,
        data: {
          id: '1234567890',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          createdAt: '2023-01-01T00:00:00.000Z'
        }
      }
    },
    {
      status: 400,
      description: 'Invalid input data',
      example: {
        success: false,
        error: 'Validation failed',
        details: ['email: Invalid email address'],
        code: 'VALIDATION_ERROR'
      }
    },
    {
      status: 409,
      description: 'User already exists',
      example: {
        success: false,
        error: 'User with this email already exists',
        code: 'USER_EXISTS'
      }
    },
    {
      status: 500,
      description: 'Server error',
      example: {
        success: false,
        error: 'Failed to register user',
        code: 'SERVER_ERROR'
      }
    }
  ]
});

// POST handler for user registration
const registerUser = withErrorHandling(async (req: NextRequest) => {
  console.log('=========== REGISTER API CALLED ===========');
  
  try {
    // Validate request body
    const validationResult = await validateRequest(req, registerUserSchema);
    
    if (!validationResult.success) {
      return validationResult.error;
    }
    
    // Extract validated data
    const { name, email, password, role = 'student' } = validationResult.data;
    
    console.log('Creating user with email:', email);
    
    // Use the centralized AuthService to register the user
    const result = await AuthService.register({ name, email, password });
    
    if (!result.success) {
      console.error('User registration failed:', result.error);
      
      return apiError(
        result.error?.message || 'Failed to register user',
        undefined,
        result.error?.code || 'REGISTRATION_FAILED',
        result.error?.status || 400
      );
    }
    
    console.log('User created successfully:', result.data?.id);
    
    // Return success response
    return apiCreated({
      id: result.data?.id,
      name: result.data?.name,
      email: result.data?.email,
      role: result.data?.role,
      createdAt: result.data?.createdAt
    }, 'User registered successfully');
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', (error as Error).stack);
    
    // Generic error response
    return apiServerError(
      'Failed to register user',
      (error as Error).message
    );
  }
  finally {
    console.log('=========== REGISTER API COMPLETED ===========');
  }
});

// Export the route handler
export const POST = registerUser;
