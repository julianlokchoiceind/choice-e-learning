import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/mongodb';
import { authenticateUser } from '@/lib/auth/auth-middleware';

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const auth = await authenticateUser(req);
    if (!auth.success) {
      return auth.response;
    }

    // Get user ID from session
    const userId = auth.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found in session' },
        { status: 401 }
      );
    }

    // Get user and enrolled courses IDs
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { enrolledIds: 1 } }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // If user has no enrolled courses, return empty array
    if (!user.enrolledIds || user.enrolledIds.length === 0) {
      return NextResponse.json({ 
        success: true, 
        courses: [],
        count: 0
      });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Convert string IDs to ObjectId
    const courseObjectIds = user.enrolledIds.map((id: string) => new ObjectId(id));
    
    // Get courses collection
    const coursesCollection = await getCollection('courses');
    
    // Get total count of enrolled courses
    const totalCount = courseObjectIds.length;
    
    // Get paginated courses with instructor details
    const courses = await coursesCollection.aggregate([
      // Match courses that user is enrolled in
      { $match: { _id: { $in: courseObjectIds } } },
      // Sort by creation date (newest first)
      { $sort: { createdAt: -1 } },
      // Apply pagination
      { $skip: skip },
      { $limit: limit },
      // Lookup instructor details
      {
        $lookup: {
          from: 'users',
          localField: 'instructorId',
          foreignField: '_id',
          as: 'instructorDetails'
        }
      },
      // Unwind instructor details (convert array to object)
      { $unwind: '$instructorDetails' },
      // Project only needed fields
      {
        $project: {
          id: { $toString: '$_id' },
          title: 1,
          description: 1,
          price: 1,
          level: 1,
          topics: 1,
          imageUrl: 1,
          createdAt: 1,
          updatedAt: 1,
          instructor: {
            id: { $toString: '$instructorDetails._id' },
            name: '$instructorDetails.name'
          }
        }
      }
    ]).toArray();

    // Return the enrolled courses
    return NextResponse.json({
      success: true,
      courses,
      count: totalCount,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + courses.length < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrolled courses' },
      { status: 500 }
    );
  }
} 