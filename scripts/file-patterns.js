// Định nghĩa các mẫu file pattern tuân theo hướng dẫn tái cấu trúc
const filePatterns = {
  // Pattern 1: Component Pattern
  componentPattern: `'use client';

import { useState } from 'react';
import { COMPONENT_INTERFACE } from '@/shared/types/TYPE_DOMAIN';

interface COMPONENT_NAMEProps {
  // Props definition
}

export const COMPONENT_NAME = ({ ...props }: COMPONENT_NAMEProps) => {
  // Component logic
  
  return (
    <div className="COMPONENT_NAME_CLASS">
      {/* Component JSX */}
    </div>
  );
};

export default COMPONENT_NAME;`,

  // Pattern 2: Hook Pattern
  hookPattern: `'use client';

import { useState, useEffect } from 'react';
import { HOOK_INTERFACE } from '@/shared/types/TYPE_DOMAIN';
import { apiClient } from '@/client/utils/http/api-client';

interface UseHOOK_NAMEOptions {
  // Options interface
}

export function useHOOK_NAME(param: string, options: UseHOOK_NAMEOptions = {}) {
  // Hook state and logic
  
  useEffect(() => {
    // Effect logic
  }, [param, options]);
  
  return { /* return values */ };
}

export default useHOOK_NAME;`,

  // Pattern 3: Service Pattern
  servicePattern: `import { prisma } from '@/server/db/prisma-client';
import { SERVICE_INTERFACE } from '@/shared/types/TYPE_DOMAIN';
import { NotFoundError, ForbiddenError } from '@/server/api/api-error-codes';

export async function getSERVICE_ITEMS(filters = {}): Promise<SERVICE_ITEM[]> {
  // Service implementation
  return prisma.SERVICE_ITEM.findMany({
    // Prisma query
  });
}

export async function getSERVICE_ITEM(id: string): Promise<SERVICE_ITEM | null> {
  // Implementation
}

export async function createSERVICE_ITEM(data: any, userId: string): Promise<SERVICE_ITEM> {
  // Implementation
}`,

  // Pattern 4: Type Pattern
  typePattern: `export interface TYPE_NAME {
  id: string;
  // Type properties
}

export interface TYPE_NAMEWithRelations extends TYPE_NAME {
  // Extended properties with relations
}`,

  // Pattern 5: Index File Pattern
  indexPattern: `export * from './FILE_NAME1';
export * from './FILE_NAME2';
export * from './FILE_NAME3';`,

  // Pattern 6: Page Component Pattern
  pageComponentPattern: `import { Suspense } from 'react';
import { PageComponentName } from '@/client/components/DOMAIN/ComponentName';
import { LoadingState } from '@/client/components/common/LoadingState';
import { getDataService } from '@/server/services/DOMAIN/service-name';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    paramId: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  // Metadata implementation
}

export default async function Page({ params }: PageProps) {
  // Fetch data
  
  // Handle not found
  
  return (
    <div className="page-container">
      <Suspense fallback={<LoadingState />}>
        {/* Page content */}
      </Suspense>
    </div>
  );
}`,

  // Pattern 7: API Route Pattern
  apiRoutePattern: `import { NextRequest } from 'next/server';
import { withAuth } from '@/server/auth/auth-middleware';
import { apiSuccess, apiError } from '@/server/api/api-response';
import { 
  getRESOURCE, 
  updateRESOURCE, 
  deleteRESOURCE 
} from '@/server/services/DOMAIN/service-name';
import { resourceSchema } from '@/shared/schemas/DOMAIN';

export const GET = async (
  req: NextRequest,
  { params }: { params: { resourceId: string } }
) => {
  try {
    // GET implementation
  } catch (error) {
    return apiError('INTERNAL_SERVER_ERROR', 'Error message');
  }
};

export const PUT = withAuth(async (
  req: NextRequest,
  { params, session }: { params: { resourceId: string }, session: any }
) => {
  try {
    // PUT implementation
  } catch (error) {
    return apiError('INTERNAL_SERVER_ERROR', 'Error message');
  }
}, { roles: ['ADMIN', 'EDITOR'] });

export const DELETE = withAuth(async (
  req: NextRequest,
  { params }: { params: { resourceId: string } }
) => {
  try {
    // DELETE implementation
  } catch (error) {
    return apiError('INTERNAL_SERVER_ERROR', 'Error message');
  }
}, { roles: ['ADMIN'] });`,

  // Pattern 8: Server Actions Pattern
  serverActionsPattern: `'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/auth-options';
import { actionService } from '@/server/services/DOMAIN/service-name';

// Validation schema
const actionSchema = z.object({
  // Schema definition
});

// Server action
export async function actionName(formData: FormData) {
  // Get session
  
  // Validate input
  
  // Call service function
  
  // Revalidate paths
  
  // Return result
}`,

  // Pattern 9: Validation Schema Pattern
  validationSchemaPattern: `import { z } from 'zod';

/**
 * Schema Name - Validation schema for X
 */
export const schemaName = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  price: z.number().min(0, 'Price must be a positive number').optional(),
  // More fields as needed
});

/**
 * Type for creating/updating an entity
 */
export type CreateXInput = z.infer<typeof schemaName>;`,

  // Pattern 10: Error Handling Pattern
  errorHandlingPattern: `'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Implementation
}

export default ErrorBoundary;`,

  // Pattern 11: Auth Middleware Pattern
  authMiddlewarePattern: `import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/auth-options';
import { apiError } from '@/server/api/api-response';

export function withAuth(handler: Function, options?: { roles?: string[] }) {
  // Implementation
}

export default withAuth;`,

  // Pattern 12: Protected Route Pattern
  protectedRoutePattern: `'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/client/hooks/auth/useAuth';
import { LoadingState } from '@/client/components/common/LoadingState';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  // Implementation
}

export default ProtectedRoute;`,

  // Pattern 13: Form Handling Pattern
  formHandlingPattern: `'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useAuth } from '@/client/hooks/auth/useAuth';

// Validation schema
const formSchema = z.object({
  // Schema definition
});

type FormData = z.infer<typeof formSchema>;

export function FormName() {
  // Form state and handlers
  
  return (
    <form onSubmit={handleSubmit} className="form-class">
      {/* Form content */}
    </form>
  );
}

export default FormName;`,

  // Pattern 14: Layout Component Pattern
  layoutComponentPattern: `'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  hideFooter?: boolean;
}

export function Layout({ children, showSidebar = false, hideFooter = false }: LayoutProps) {
  // Layout implementation
}

export default Layout;`,

  // Pattern 15: Provider Pattern
  providerPattern: `'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Provider configuration
const providerConfig = {
  // Configuration options
};

interface ProviderProps {
  children: ReactNode;
}

export function ProviderName({ children }: ProviderProps) {
  // Provider implementation
}

export default ProviderName;`,

  // Pattern 16: Database Service Pattern
  databaseServicePattern: `import { prisma } from '@/server/db/prisma-client';
import { Prisma } from '@prisma/client';
import { NotFoundError } from '@/server/api/api-error-codes';

export async function findEntityById(id: string) {
  // Database query
}

export async function findEntities(params: {
  skip?: number;
  take?: number;
  where?: any;
  orderBy?: any;
}) {
  // Database query
}

export async function createEntity(data: any) {
  // Database create operation
}

export async function updateEntity(id: string, data: any) {
  // Database update operation
}

export async function deleteEntity(id: string) {
  // Database delete operation
}`,

  // Pattern 17: Testing Pattern
  testingPattern: `import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ComponentName } from '@/client/components/DOMAIN/ComponentName';

const mockData = {
  // Mock data for testing
};

describe('ComponentName Component', () => {
  // Test cases
  
  test('renders correctly', () => {
    // Test implementation
  });
  
  test('handles specific behavior', async () => {
    // Test implementation
  });
});`
};

module.exports = filePatterns;