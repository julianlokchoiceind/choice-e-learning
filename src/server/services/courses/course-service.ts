export const dynamic = 'force-dynamic';

/**
 * Course services for managing course data and operations
 */
import prisma from '@/server/db/prisma-client';
import { safeFindMany, safeFindUnique } from '@/server/db/prisma-helper';
import { CourseListItem, CourseDetails, UserCourseStats, Course, Lesson } from '@/shared/types/courses/course';
import { UserProgress } from '@/shared/types/progress';


/**
 * Chuẩn hóa URL hình ảnh để đảm bảo nhất quán
 * @param originalUrl URL gốc có thể null, tương đối hoặc tuyệt đối
 * @returns URL chuẩn hóa đảm bảo đúng định dạng
 */
function processImageUrl(originalUrl?: string | null): string {
  // Không có URL, trả về URL mặc định
  if (!originalUrl) {
    return '/images/course-default.jpg';
  }
  
  // URL đã là tuyệt đối, giữ nguyên
  if (originalUrl.startsWith('http')) {
    // Thêm cache busting parameter
    return `${originalUrl}${originalUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
  }
  
  // URL tương đối đã có dấu / ở đầu, giữ nguyên
  if (originalUrl.startsWith('/')) {
    return originalUrl;
  }
  
  // URL tương đối không có dấu / ở đầu, thêm vào
  return `/${originalUrl}`;
}

// Local interfaces for internal use
interface EnrolledUser {
  id: string;
  enrolledIn?: { id: string }[];
  enrolledIds?: string[];
}

// Extended lesson interface for safe property access
interface ExtendedLesson {
  id: string;
  title: string;
  content: string;
  order: number;
  courseId: string;
  videoUrl: string | null;
  duration: string | null;
  resourcesData: string | null;
  chapterId: string | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

/**
 * Get all courses from the database
 * @returns Array of processed course list items
 */
export async function getAllCourses(): Promise<CourseListItem[]> {
  try {
    const courses = await prisma.course.findMany({
      include: {
        reviews: true,
        lessons: true,
        _count: {
          select: {
            students: true,
            reviews: true,
            lessons: true
          }
        }
      }
    });
    
    if (!courses || !Array.isArray(courses)) {
      console.warn('getAllCourses returned no data or invalid format');
      return [];
    }
    
    // Process the courses to match our CourseListItem interface
    const processedCourses = await Promise.all(
      courses.map(async (course: any) => {
        // Get creator info if available
        const creator = course.creatorId 
          ? await prisma.user.findUnique({ where: { id: course.creatorId } })
          : null;
        
        // Calculate rating
        const rating = Array.isArray(course.reviews) && course.reviews.length > 0 
          ? Number((course.reviews.reduce((acc: number, review) => acc + (review?.rating || 0), 0) / course.reviews.length).toFixed(1))
          : 4.5; // Default if no reviews
        
        // Chuẩn hóa URL hình ảnh (chỉ dùng một trường imageUrl)
        const imageUrl = processImageUrl(course.imageUrl);
        
        return {
          id: course.id,
          title: course.title,
          description: course.description,
          imageUrl: imageUrl, // URL hình ảnh đã chuẩn hóa
          image: imageUrl, // Đảm bảo luôn là string
          level: course.level,
          price: course.price,
          duration: `${Math.ceil(course._count.lessons / 2)} weeks`, // Approximate duration
          isFeatured: Array.isArray(course.topics) && course.topics.includes('featured'),
          students: course._count.students,
          rating: rating,
          reviews: course._count.reviews,
          instructorName: creator?.name || 'Administrator',
          learningPoints: Array.isArray(course.topics) ? course.topics : [],
          updatedAt: course.updatedAt, // Thêm trường updatedAt để client có thể kiểm tra thời điểm cập nhật
        };
      })
    );

    return processedCourses;
  } catch (error: unknown) {
    console.error('Error fetching all courses:', error);
    return [];
  }
}

/**
 * Get a course by ID with complete details
 * @param courseId Course ID to fetch
 * @returns Complete course details or null if not found
 */
export async function getCourseById(courseId: string) {
  try {
    if (!courseId) {
      console.warn('getCourseById called with empty courseId');
      return null;
    }
    
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        students: true,
        _count: {
          select: {
            students: true,
            reviews: true,
            lessons: true
          }
        }
      }
    });
    
    if (!course) {
      console.warn(`Course with ID ${courseId} not found`);
      return null;
    }
    
    // Get creator info if available
    const creator = course.creatorId 
      ? await prisma.user.findUnique({ where: { id: course.creatorId } })
      : null;
    
    // Process reviews to include user names
    const processedReviews = Array.isArray(course.reviews) ? course.reviews.map((review: any) => {
      return {
        name: review?.user?.name || 'Anonymous',
        rating: review?.rating || 5,
        avatar: 'https://randomuser.me/api/portraits/women/63.jpg', // Default avatar
        date: `${Math.floor((Date.now() - new Date(review?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 30))} months ago`,
        comment: review?.comment || 'Great course!',
      };
    }) : [];
    
    // Calculate rating
    const rating = Array.isArray(course.reviews) && course.reviews.length > 0 
      ? Number((course.reviews.reduce((acc: number, review) => acc + (review?.rating || 0), 0) / course.reviews.length).toFixed(1))
      : 4.5; // Default if no reviews
    
    // Chuẩn hóa URL hình ảnh
    const imageUrl = processImageUrl(course.imageUrl);
      
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      fullDescription: course.description,
      imageUrl: imageUrl,
      level: course.level,
      price: course.price,
      duration: `${Math.ceil(Array.isArray(course.lessons) ? course.lessons.length : 0 / 2)} weeks`, // Approximate duration
      lessonsCount: Array.isArray(course.lessons) ? course.lessons.length : 0,
      totalHours: Number(((Array.isArray(course.lessons) ? course.lessons.length : 0) * 0.5).toFixed(1)), // Approximate hours
      lastUpdated: new Date(course.updatedAt).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      rating: rating,
      reviewsCount: Array.isArray(course.reviews) ? course.reviews.length : 0,
      isFeatured: Array.isArray(course.topics) && course.topics.includes('featured'),
      learningPoints: Array.isArray(course.topics) ? course.topics : [],
      instructor: {
        name: creator?.name || 'Administrator',
        role: 'Course Creator',
        bio: 'Course creator and educator',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        rating: 4.9,
        students: Array.isArray(course.students) ? course.students.length : 0,
        courses: 1, // Simplified
      },
      reviews: processedReviews,
      updatedAt: course.updatedAt // Đảm bảo có trường này để client có thể kiểm tra
    };
  } catch (error: unknown) {
    console.error('Error fetching course by ID:', error);
    return null;
  }
}

/**
 * Get total student count across all courses
 * @returns Total number of students
 */
export async function getTotalStudentCount(): Promise<number> {
  try {
    return await prisma.user.count({
      where: { role: 'student' }
    });
  } catch (error: unknown) {
    console.error('Error getting total student count:', error);
    return 0;
  }
}

/**
 * Get enrollment count for a specific course
 * @param courseId Course ID to check
 * @returns Number of students enrolled
 */
export async function getCourseEnrollmentCount(courseId: string): Promise<number> {
  try {
    if (!courseId) {
      console.warn('getCourseEnrollmentCount called with empty courseId');
      return 0;
    }
    
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: { students: true }
        }
      }
    });
    
    return course?._count?.students || 0;
  } catch (error: unknown) {
    console.error('Error getting course enrollment count:', error);
    return 0;
  }
}

/**
 * Enroll a user in a course
 * @param userId User ID to enroll
 * @param courseId Course ID to enroll in
 * @returns Success boolean
 */
export async function enrollUserInCourse(userId: string, courseId: string): Promise<boolean> {
  try {
    if (!userId || !courseId) {
      console.warn('enrollUserInCourse called with missing parameters');
      return false;
    }
    
    // Check if course exists
    const course = await safeFindUnique(prisma.course, {
      where: { id: courseId }
    });
    
    if (!course) {
      console.warn(`Course with ID ${courseId} not found`);
      return false;
    }
    
    // Check if user exists
    const user = await safeFindUnique(prisma.user, {
      where: { id: userId }
    });
    
    if (!user) {
      console.warn(`User with ID ${userId} not found`);
      return false;
    }
    
    // Check if already enrolled
    const alreadyEnrolled = await prisma.course.findFirst({
      where: {
        id: courseId,
        students: {
          some: {
            id: userId
          }
        }
      }
    });
    
    if (alreadyEnrolled) {
      // Already enrolled, consider it a success
      return true;
    }
    
    // Enroll the user
    await prisma.course.update({
      where: { id: courseId },
      data: {
        students: {
          connect: { id: userId }
        }
      }
    });
    
    return true;
  } catch (error: unknown) {
    console.error('Error enrolling user in course:', error);
    return false;
  }
}

/**
 * Get user course statistics
 * @param userId User ID to get stats for
 * @returns User course statistics
 */
export async function getUserStats(userId: string): Promise<UserCourseStats> {
  try {
    if (!userId) {
      console.warn('getUserStats called with missing userId');
      return {
        coursesCompleted: 0,
        lessonsCompleted: 0,
        totalHoursLearned: 0,
        currentStreak: 0,
      };
    }

    // Use safeFindUnique instead of direct prisma call
    const user = await safeFindUnique<EnrolledUser, any>(
      prisma.user,
      {
        where: { id: userId },
        include: {
          enrolledIn: true
        }
      }
    );
    
    if (!user) {
      console.warn(`User with ID ${userId} not found`);
      return {
        coursesCompleted: 0,
        lessonsCompleted: 0,
        totalHoursLearned: 0,
        currentStreak: 0,
      };
    }
    
    // Use safeFindMany instead of direct prisma call
    const userProgress = await safeFindMany(
      prisma.userProgress,
      { where: { userId } }
    );
    
    if (!user.enrolledIn || !Array.isArray(user.enrolledIn) || user.enrolledIn.length === 0) {
      return {
        coursesCompleted: 0,
        lessonsCompleted: 0,
        totalHoursLearned: 0,
        currentStreak: 0,
      };
    }
    
    let completedLessons = 0;
    let coursesCompleted = 0;
    let totalHoursLearned = 0;
    
    // Get all lessons for enrolled courses
    const enrolledCourseIds = user.enrolledIds || 
      (Array.isArray(user.enrolledIn) 
        ? user.enrolledIn.map((course) => course?.id).filter(Boolean)
        : []);
    
    // Process each enrolled course
    for (const courseId of enrolledCourseIds) {
      if (!courseId) continue;
      // Get all lessons for this course
      try {
        // Use safeFindMany helper function
        const courseLessons = await safeFindMany<ExtendedLesson, any>(prisma.lesson, {
          where: { courseId }
        });
        
        // Count completed lessons
        let courseCompletedLessons = 0;
        
        if (courseLessons && Array.isArray(courseLessons)) {
          for (const lesson of courseLessons) {
            // Make sure lesson has an id
            if (!lesson || !lesson.id) continue;
            
            const progressEntry = Array.isArray(userProgress) 
              ? userProgress.find((p) => 
                  p?.courseId === courseId && 
                  p?.lessonId === lesson.id && 
                  p?.completed
                )
              : null;
            
            if (progressEntry) {
              completedLessons++;
              courseCompletedLessons++;
              // Add time spent to total hours (if available)
              if (progressEntry.timeSpent) {
                totalHoursLearned += progressEntry.timeSpent / 3600; // Convert seconds to hours
              } else {
                // Estimate if not available
                totalHoursLearned += 0.5; // Default 30 minutes per lesson
              }
            }
          }
          
          // Check if course is completed
          const lessonsCount = Array.isArray(courseLessons) ? courseLessons.length : 0;
          if (courseCompletedLessons === lessonsCount && lessonsCount > 0) {
            coursesCompleted++;
          }
        }
      } catch (err: unknown) {
        console.error(`Error processing course ${courseId}:`, err);
      }
    }
    
    // Calculate current streak
    const streakDays = calculateStreak(userProgress as UserProgress[]);
    
    return {
      coursesCompleted,
      lessonsCompleted: completedLessons,
      totalHoursLearned: Math.round(totalHoursLearned * 10) / 10, // Round to 1 decimal place
      currentStreak: streakDays,
    };
  } catch (error: unknown) {
    console.error('Error getting user stats:', error);
    return {
      coursesCompleted: 0,
      lessonsCompleted: 0,
      totalHoursLearned: 0,
      currentStreak: 0,
    };
  }
}

/**
 * Calculate user streak based on user progress
 * @param userProgress Array of user progress entries
 * @returns Number of days in streak
 */
function calculateStreak(userProgress: UserProgress[]): number {
  // If no progress, return 0
  if (!Array.isArray(userProgress) || userProgress.length === 0) {
    return 0;
  }
  
  // Get completion dates ordered by most recent first
  const completionDates = userProgress
    .filter((p) => p?.completed)
    .map((p) => new Date(p?.completedAt || Date.now()))
    .sort((a, b) => b.getTime() - a.getTime()); // Sort in descending order
  
  if (completionDates.length === 0) {
    return 0;
  }
  
  // Check if user has completed anything today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const mostRecentDate = new Date(completionDates[0]);
  mostRecentDate.setHours(0, 0, 0, 0);
  
  // If most recent activity was before yesterday, streak is broken
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (mostRecentDate < yesterday) {
    return 0;
  }
  
  // Calculate streak by counting consecutive days
  let streak = 1; // Start with 1 for the most recent day
  let currentDate = mostRecentDate;
  
  for (let i = 1; i < completionDates.length; i++) {
    const prevDate = new Date(completionDates[i]);
    prevDate.setHours(0, 0, 0, 0);
    
    // Check if this date is the previous day
    const expectedPrevDate = new Date(currentDate);
    expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);
    
    if (prevDate.getTime() === expectedPrevDate.getTime()) {
      streak++;
      currentDate = prevDate;
    } else if (prevDate.getTime() === currentDate.getTime()) {
      // Same day activity, skip
      continue;
    } else {
      // Break in streak
      break;
    }
  }
  
  return streak;
}

/**
 * Get featured courses
 * @param limit Maximum number of courses to return
 * @returns Array of featured courses
 */
export async function getFeaturedCourses(limit = 5): Promise<CourseListItem[]> {
  try {
    const courses = await prisma.course.findMany({
      where: {
        topics: {
          has: 'featured'
        }
      },
      include: {
        reviews: true,
        _count: {
          select: {
            students: true,
            reviews: true,
            lessons: true
          }
        }
      },
      take: limit
    });
    
    if (!courses || !Array.isArray(courses)) {
      return [];
    }
    
    // Process the courses (simplified to avoid duplicate code)
    const processedCourses = await Promise.all(
      courses.map(async (course: any) => {
        const creator = course.creatorId 
          ? await prisma.user.findUnique({ where: { id: course.creatorId } })
          : null;
        
        const rating = Array.isArray(course.reviews) && course.reviews.length > 0 
          ? Number((course.reviews.reduce((acc: number, review) => acc + (review?.rating || 0), 0) / course.reviews.length).toFixed(1))
          : 4.5;
        
        return {
          id: course.id,
          title: course.title,
          description: course.description,
          imageUrl: processImageUrl(course.imageUrl),
          image: processImageUrl(course.imageUrl),
          level: course.level,
          price: course.price,
          duration: `${Math.ceil((course._count?.lessons || 0) / 2)} weeks`,
          isFeatured: true,
          students: course._count?.students || 0,
          rating: rating,
          reviews: course._count?.reviews || 0,
          instructorName: creator?.name || 'Administrator',
          learningPoints: Array.isArray(course.topics) ? course.topics : [],
        };
      })
    );

    return processedCourses;
  } catch (error: unknown) {
    console.error('Error fetching featured courses:', error);
    return [];
  }
}

/**
 * Search courses by title, description, or topics
 * @param query Search query string
 * @param limit Maximum number of results to return
 * @returns Array of matching courses
 */
export async function searchCourses(query: string, limit = 10): Promise<CourseListItem[]> {
  try {
    if (!query) {
      return [];
    }
    
    const searchQuery = query.toLowerCase().trim();
    
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          {
            title: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          },
          {
            topics: {
              has: searchQuery
            }
          }
        ]
      },
      include: {
        reviews: true,
        _count: {
          select: {
            students: true,
            reviews: true,
            lessons: true
          }
        }
      },
      take: limit
    });
    
    if (!courses || !Array.isArray(courses)) {
      return [];
    }
    
    // Process the courses (same logic as in getAllCourses)
    const processedCourses = await Promise.all(
      courses.map(async (course: any) => {
        const creator = course.creatorId 
          ? await prisma.user.findUnique({ where: { id: course.creatorId } })
          : null;
        
        const rating = Array.isArray(course.reviews) && course.reviews.length > 0 
          ? Number((course.reviews.reduce((acc: number, review) => acc + (review?.rating || 0), 0) / course.reviews.length).toFixed(1))
          : 4.5;
        
        return {
          id: course.id,
          title: course.title,
          description: course.description,
          imageUrl: processImageUrl(course.imageUrl),
          image: processImageUrl(course.imageUrl),
          level: course.level,
          price: course.price,
          duration: `${Math.ceil((course._count?.lessons || 0) / 2)} weeks`,
          isFeatured: Array.isArray(course.topics) && course.topics.includes('featured'),
          students: course._count?.students || 0,
          rating: rating,
          reviews: course._count?.reviews || 0,
          instructorName: creator?.name || 'Administrator',
          learningPoints: Array.isArray(course.topics) ? course.topics : [],
        };
      })
    );

    return processedCourses;
  } catch (error: unknown) {
    console.error('Error searching courses:', error);
    return [];
  }
}

/**
 * Get all unique topics from courses
 * @returns Array of unique topic strings
 */
export async function getAllTopics(): Promise<string[]> {
  try {
    // Fetch all courses and extract their topics
    const courses = await prisma.course.findMany({
      select: {
        topics: true
      }
    });
    
    if (!courses || !Array.isArray(courses)) {
      return [];
    }
    
    // Extract topics from all courses and flatten the array
    const allTopics = courses.reduce((acc: string[], course) => {
      if (Array.isArray(course.topics)) {
        return [...acc, ...course.topics];
      }
      return acc;
    }, []);
    
    // Remove duplicates and filter out 'featured' which is a special tag
    const uniqueSet = new Set(allTopics);
    const uniqueTopics = Array.from(uniqueSet).filter(topic => topic !== 'featured');
    
    // Sort alphabetically
    return uniqueTopics.sort();
  } catch (error: unknown) {
    console.error('Error fetching all topics:', error);
    return [];
  }
}

// Thêm các function bị thiếu
export const getCourse = async (courseId: string) => {
  try {
    // Triển khai logic lấy thông tin khóa học
    return { id: courseId, title: "Course title", /* các thông tin khác */ };
  } catch (error: unknown) {
    console.error("Error fetching course:", error);
    throw error;
  }
};

export const getUserCourses = async (userId: string) => {
  try {
    // Triển khai logic lấy khóa học của người dùng
    return [
      { id: "1", title: "Course 1" },
      { id: "2", title: "Course 2" }
    ];
  } catch (error: unknown) {
    console.error("Error fetching user courses:", error);
    throw error;
  }
};