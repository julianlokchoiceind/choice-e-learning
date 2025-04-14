import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { EnrolledCourse } from '@/types/course';
import { ObjectId } from 'mongodb';
import { checkAndAwardAchievements } from '@/services/achievements';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // Get the currently authenticated user for verification
    const session = await getServerSession(authOptions);
    
    // Only allow users to fetch their own enrolled courses
    if (!session?.user?.id || (session.user.id !== userId && session.user.role !== 'admin')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Get the necessary collections
    const enrollmentsCollection = await getCollection('enrollments');
    const coursesCollection = await getCollection('courses');
    const userProgressCollection = await getCollection('userProgress');
    
    // Get all enrollments for the user
    const enrollments = await enrollmentsCollection.find({ userId }).toArray();
    
    if (!enrollments.length) {
      return NextResponse.json({ 
        success: true, 
        courses: [] 
      });
    }
    
    // Get the course IDs from enrollments
    const courseIds = enrollments.map(enrollment => enrollment.courseId);
    
    // Get basic course data for all enrolled courses
    const courses = await coursesCollection.find({ 
      _id: { $in: courseIds.map(id => typeof id === 'string' ? id : id.toString()) } 
    }).toArray();
    
    // Get progress data for each course
    const progressData = await userProgressCollection.aggregate([
      { $match: { userId, courseId: { $in: courseIds } } },
      { $group: {
          _id: '$courseId',
          completedLessons: {
            $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
          },
          totalTimeSpent: { $sum: '$timeSpent' }
        }
      }
    ]).toArray();

    // Create a map of progress data by courseId
    const progressMap = progressData.reduce((map, item) => {
      map[item._id] = {
        completedLessons: item.completedLessons,
        totalTimeSpent: item.totalTimeSpent
      };
      return map;
    }, {} as Record<string, { completedLessons: number, totalTimeSpent: number }>);
    
    // Format the response data
    const enrolledCourses: EnrolledCourse[] = await Promise.all(
      courses.map(async (course) => {
        const courseId = course._id.toString();
        
        // Get total lessons for the course
        const totalLessons = await getCollection('lessons')
          .then(collection => collection.countDocuments({ courseId }));
        
        // Get progress data or default values
        const progress = progressMap[courseId] || { completedLessons: 0, totalTimeSpent: 0 };
        
        // Calculate progress percentage
        const progressPercentage = totalLessons > 0 
          ? Math.round((progress.completedLessons / totalLessons) * 100) 
          : 0;
        
        return {
          id: courseId,
          title: course.title,
          progress: progressPercentage,
          imageUrl: course.image || '/images/course-placeholder.jpg',
          totalLessons,
          completedLessons: progress.completedLessons
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      courses: enrolledCourses
    });
    
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch enrolled courses' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the currently authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.courseId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course ID is required' 
      }, { status: 400 });
    }
    
    const { courseId } = data;
    
    // Get the enrollments collection
    const enrollmentsCollection = await getCollection('enrollments');
    
    // Check if enrollment already exists
    const existingEnrollment = await enrollmentsCollection.findOne({
      userId,
      courseId
    });
    
    if (existingEnrollment) {
      return NextResponse.json({ 
        success: false, 
        error: 'Already enrolled in this course' 
      }, { status: 409 });
    }
    
    // Get the course to make sure it exists
    const coursesCollection = await getCollection('courses');
    const course = await coursesCollection.findOne({ 
      _id: new ObjectId(courseId) 
    });
    
    if (!course) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course not found' 
      }, { status: 404 });
    }
    
    // Create enrollment record
    const now = new Date();
    const result = await enrollmentsCollection.insertOne({
      userId,
      courseId,
      enrolledAt: now,
      status: 'active',
      progress: 0,
      completedLessons: 0,
      createdAt: now,
      updatedAt: now
    });
    
    // Update user's enrolledIds array
    const usersCollection = await getCollection('users');
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $addToSet: { "enrolledIds": courseId } 
      }
    );
    
    // Add the user to the course's studentIds
    await coursesCollection.updateOne(
      { _id: new ObjectId(courseId) },
      { 
        $addToSet: { "studentIds": userId } 
      }
    );
    
    // Check and award achievements (like "Course Starter")
    await checkAndAwardAchievements(userId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully enrolled in course',
      enrollmentId: result.insertedId.toString()
    });
    
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to enroll in course' 
    }, { status: 500 });
  }
} 