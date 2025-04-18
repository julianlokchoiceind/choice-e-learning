import { NextRequest, NextResponse } from 'next/server';
import { registerUserSchema } from '@/utils/validation';
import { AuthService } from '@/lib/auth/services/auth-service';

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
    
    // Use the centralized AuthService to register the user
    const result = await AuthService.register({ name, email, password });
    
    if (!result.success) {
      console.error('User registration failed:', result.error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: result.error?.message || 'Failed to register user' 
        },
        { status: result.error?.status || 400 }
      );
    }
    
    console.log('User created successfully:', result.data?.id);
    
    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        user: {
          id: result.data?.id,
          name: result.data?.name,
          email: result.data?.email,
          role: result.data?.role,
          createdAt: result.data?.createdAt
        }
      },
      { status: 201 }
    );
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