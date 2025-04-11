import { NextRequest, NextResponse } from 'next/server';
import { registerUserSchema } from '@/utils/validation';
import { createUserDirectly } from '@/lib/db/mongodb';
import { hashPassword } from '@/utils/auth-utils';

export async function POST(req: NextRequest) {
  console.log('=========== REGISTER API CALLED ===========');
  console.log('Request method:', req.method);
  
  try {
    // Parse request body
    let reqText;
    try {
      reqText = await req.text();
      console.log('Raw request body length:', reqText.length);
    } catch (textError) {
      console.error('Error reading request body:', textError);
      return NextResponse.json({ 
        success: false, 
        error: 'Could not read request body',
        details: (textError as Error).message
      }, { status: 400 });
    }
    
    // Parse JSON
    let body;
    try {
      body = JSON.parse(reqText);
      console.log('Parsed body received');
    } catch (e) {
      console.error('JSON parse error:', e);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON body',
        details: (e as Error).message
      }, { status: 400 });
    }
    
    // Validate input data
    console.log('Validating input data...');
    const validation = registerUserSchema.safeParse(body);
    if (!validation.success) {
      console.error('Validation errors:', validation.error.errors);
      // Simplified error format for user-friendly messages
      const formattedErrors = validation.error.errors.map((err: any) => {
        return `${err.path.join('.')}: ${err.message}`;
      }).join(', ');
      
      return NextResponse.json(
        { 
          success: false, 
          error: formattedErrors || 'Invalid input data'
        },
        { status: 400 }
      );
    }
    console.log('Input data valid');
    
    // Extract validated data
    const { name, email, password, role = 'student' } = validation.data;
    console.log('Creating user with email:', email);
    
    try {
      // Hash the password before storing
      const hashedPassword = await hashPassword(password);
      
      // Create user directly with MongoDB
      console.log('Calling createUserDirectly...');
      const result = await createUserDirectly({ 
        name, 
        email, 
        password: hashedPassword, 
        role
      });
      
      if (!result.success) {
        console.error('User creation failed:', result.error);
        
        // Check for specific error messages
        if (result.error?.includes('already exists')) {
          return NextResponse.json(
            { success: false, error: 'Email already in use' },
            { status: 409 }
          );
        }
        
        return NextResponse.json(
          { success: false, error: result.error || 'Failed to create user' },
          { status: 400 }
        );
      }
      
      console.log('User created successfully:', result.id);
      
      // Return success response
      return NextResponse.json(
        { 
          success: true, 
          user: {
            id: result.id,
            name: result.name,
            email: result.email,
            role: result.role,
            createdAt: result.createdAt
          }
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('User creation error:', error);
      
      // Check for specific error types
      if ((error as Error).message.includes('already exists')) {
        console.error('Email already exists error');
        return NextResponse.json(
          { success: false, error: 'Email already in use' },
          { status: 409 }
        );
      }
      
      // Check for connection errors
      if ((error as Error).message.includes('connect ECONNREFUSED') ||
          (error as Error).message.includes('connection error') ||
          (error as Error).message.includes('database')) {
        console.error('Database connection error');
        return NextResponse.json(
          { 
            success: false, 
            error: 'Database connection failed. Please try again later.' 
          },
          { status: 503 }
        );
      }
      
      // Password processing errors
      if ((error as Error).message.includes('password')) {
        console.error('Password processing error');
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to process password. Please try a different password.' 
          },
          { status: 400 }
        );
      }
      
      console.error('Unknown error during user creation:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Registration failed. Please try again.',
          details: (error as Error).message
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', (error as Error).stack);
    
    // Generic error response
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to register user',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
  finally {
    console.log('=========== REGISTER API COMPLETED ===========');
  }
} 