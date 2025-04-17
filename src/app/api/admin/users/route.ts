import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/mongodb';
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
    
    // Get users collection
    const usersCollection = await getCollection('users');
    
    // Get total count of matching users
    const totalCount = await usersCollection.countDocuments(filter);
    
    // Build sort options
    const sortOptions: any = {};
    // Only allow sorting by certain fields for security
    if (['name', 'email', 'role', 'createdAt', 'updatedAt'].includes(sortBy)) {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      // Default sort by createdAt descending
      sortOptions.createdAt = -1;
    }
    
    // Get paginated users
    const users = await usersCollection.find(filter)
      .project({ password: 0 }) // Exclude password
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // Format users for response
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    
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