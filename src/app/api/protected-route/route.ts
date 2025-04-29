import { NextRequest } from 'next/server';
import { apiSuccess } from '@/lib/api/api-response';
import { withAuth } from '@/lib/api/route-handlers';

export const GET = withAuth(async (_req, context) => {
  return apiSuccess({
    message: 'This is a protected route',
    user: {
      id: context.user.id,
      name: context.user.name,
      email: context.user.email,
      role: context.user.role
    }
  });
}); 