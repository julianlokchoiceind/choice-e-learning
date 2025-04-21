import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth/auth-middleware';
import { Role } from '@/lib/auth/auth-options';

export async function GET(req: NextRequest) {
  try {
    // Authenticate and authorize admin
    const auth = await requireAdmin(req);
    if (!auth.success) {
      return auth.response;
    }

    // Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const role = url.searchParams.get('role') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter: any = {};
    
    // Add role filter if specified and valid
    if (role && Object.values(Role).includes(role as Role)) {
      filter.role = role;
    }
    
    // Add search filter if provided
    if (search) {
      // Search in name and email fields
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build Prisma where clause from filter
    const where: any = {};
    
    // Add role filter if specified and valid
    if (filter.role) {
      where.role = filter.role;
    }
    
    // Add search filter if provided
    if (filter.$or) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Get total count of matching users
    const totalCount = await prisma.user.count({ where });
    
    // Build Prisma orderBy
    let orderBy: any = {};
    // Only allow sorting by certain fields for security
    if (['name', 'email', 'role', 'createdAt', 'updatedAt'].includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      // Default sort by createdAt descending
      orderBy = { createdAt: 'desc' };
    }
    
    // Get paginated users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy,
      skip,
      take: limit
    });
    
    // No need for additional formatting since Prisma already provides correctly structured data
    const formattedUsers = users;
    
    // Return paginated users
    return NextResponse.json({
      success: true,
      users: formattedUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + users.length < totalCount
      },
      filters: {
        search: search || undefined,
        role: role || undefined,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 