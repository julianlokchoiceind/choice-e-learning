import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, Role } from './auth-options';

// Get the authenticated user's session
export async function getAuthSession() {
  return await getServerSession(authOptions);
}

// Middleware to check if user is authenticated
export async function authenticateUser(req: NextRequest) {
  const session = await getAuthSession();
  
  if (!session?.user) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    };
  }
  
  return {
    success: true,
    session,
    user: session.user
  };
}

// Check if user has required role(s)
export async function checkUserRole(req: NextRequest, roles: Role | Role[]) {
  const auth = await authenticateUser(req);
  
  if (!auth.success) {
    return auth;
  }
  
  // TypeScript knows auth.user exists if auth.success is true
  const userRole = auth.user?.role;
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    };
  }
  
  return auth;
}

// Check if user is admin
export async function requireAdmin(req: NextRequest) {
  return await checkUserRole(req, Role.admin);
}

// Check if user is accessing their own resource
export async function requireSelfOrAdmin(req: NextRequest, userId: string) {
  const auth = await authenticateUser(req);
  
  if (!auth.success) {
    return auth;
  }
  
  // TypeScript knows auth.user exists if auth.success is true
  const isAdmin = auth.user?.role === Role.admin;
  const isSelf = auth.user?.id === userId;
  
  if (!isAdmin && !isSelf) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    };
  }
  
  return auth;
} 