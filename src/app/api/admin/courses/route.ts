import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma-client';
import { withAdmin } from '@/lib/api/route-handlers';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Function to process image URL consistently
function processImageUrl(originalUrl?: string | null): string {
  // No URL, return default URL
  if (!originalUrl) {
    return '/images/placeholder-course.jpg';
  }
  
  // URL is already absolute, keep it as is
  if (originalUrl.startsWith('http')) {
    return originalUrl;
  }
  
  // Relative URL already has / at the beginning, keep it as is
  if (originalUrl.startsWith('/')) {
    return originalUrl;
  }
  
  // Relative URL without / at the beginning, add it
  return `/${originalUrl}`;
}

// Schema for chapter validation
const chapterSchema = z.object({
  title: z.string().min(1, "Chapter title is required"),
  description: z.string().optional(),
  order: z.number().int().min(1, "Order must be a positive integer")
});

// Schema for resource validation
const resourceSchema = z.object({
  title: z.string().min(1, "Resource title is required"),
  url: z.string().url("Must be a valid URL"),
  type: z.string()
});

// Schema for lesson validation
const lessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required"),
  description: z.string().optional().default(""),
  order: z.number().int().min(1, "Order must be a positive integer"),
  videoUrl: z.string().url("Must be a valid URL"),
  chapterId: z.string().optional(),
  resources: z.array(resourceSchema).optional().default([])
});

// Schema for course validation
const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0, "Price must be a positive number"),
  level: z.enum(["beginner", "intermediate", "advanced", "all"]),
  topics: z.array(z.string()),
  videoUrl: z.string().url("Must be a valid URL").optional(),
  imageUrl: z.string().url("Must be a valid URL").optional(),
  chapters: z.array(chapterSchema).optional(),
  lessons: z.array(lessonSchema),
  slug: z.string().optional() // Add this line to include slug property
});

// Define valid level values exactly as they are stored in the database
const VALID_LEVEL_VALUES = ['beginner', 'intermediate', 'advanced', 'all'];

// POST - Create a new course
export const POST = withAdmin(async (req: Request, context: any) => {
  try {
    console.log('Admin user creating course:', context.user.email);
    
    const CourseSchema = z.object({
      title: z.string().min(1, { message: 'Title is required' }),
      description: z.string().min(1, { message: 'Description is required' }),
      imageUrl: z.string().url({ message: 'Please provide a valid URL for image' }).optional(),
      price: z.number().nonnegative({ message: 'Price must be a positive number' }),
      level: z.enum(['beginner', 'intermediate', 'advanced', 'all']),
      topics: z.array(z.string()),
      videoUrl: z.string().url({ message: 'Please provide a valid URL for video' }).optional(),
      chapters: z.array(chapterSchema).optional().default([]),
      lessons: z.array(lessonSchema).min(1, { message: 'At least one lesson is required' })
    });

    // Validate body
    const body = await req.json();
    console.log('Request body:', body);
    
    // Convert 'all' level to 'beginner' to match the database schema
    if (body.level === 'all') {
      body.level = 'beginner';
    }
    
    const validationResult = CourseSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('Validation errors:', validationResult.error.format());
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid course data', 
          details: validationResult.error.format(),
          message: validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        },
        { status: 400 }
      );
    }

    const { 
      title, 
      description, 
      imageUrl, 
      price, 
      level,
      topics,
      videoUrl
    } = validationResult.data;

    // Generate a slug from the title
    const slug = title.toLowerCase().replace(/\s+/g, '-') + '-' + uuidv4().substring(0, 8);

    // Extract chapters and lessons from the validated data
    const { chapters = [], lessons = [] } = validationResult.data;

    // Từ mảng tên topic, tìm (hoặc tạo) các Topic trong DB
    const topicObjects = await Promise.all(
      topics.map(async (topicName) => {
        // Tìm topic theo tên
        let topic = await prisma.topic.findFirst({
          where: { name: { equals: topicName, mode: 'insensitive' } }
        });
        
        // Nếu không tìm thấy, tạo mới
        if (!topic) {
          const slug = topicName.toLowerCase().replace(/\s+/g, '-');
          topic = await prisma.topic.create({
            data: {
              name: topicName,
              slug,
              isActive: true
            }
          });
        }
        
        return topic;
      })
    );

    // Lấy mảng ID của các topic
    const topicIds = topicObjects.map(topic => topic.id);

    // Create the course with Prisma
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        imageUrl: processImageUrl(imageUrl),
        price,
        level,
        topics: topics, // Giữ lại để tương thích ngược
        topicIds: topicIds, // Liên kết với các Topic thực sự
        studentIds: [],
      }
    });

    // Check if course was created successfully
    if (!newCourse) {
      return NextResponse.json(
        { success: false, error: 'Failed to create course' },
        { status: 500 }
      );
    }

    try {
      // Step 1: Create chapters if any
      console.log('Creating chapters:', chapters.length);
      const createdChapters = [];
      for (const chapter of chapters) {
        try {
          const newChapter = await prisma.chapter.create({
            data: {
              title: chapter.title,
              description: '',  // No description as per requirements
              order: chapter.order,
              courseId: newCourse.id
            }
          });
          console.log('Created chapter:', newChapter);
          createdChapters.push(newChapter);
        } catch (chapterError) {
          console.error('Error creating chapter:', chapterError);
          // Continue to next chapter if this one fails
        }
      }

      // Step 2: Create lessons
      console.log('Creating lessons:', lessons.length);
      for (const lesson of lessons) {
        try {
          // Find corresponding chapter if chapterId is provided
          let chapterId = undefined;
          if (lesson.chapterId) {
            console.log('Looking for chapter with ID:', lesson.chapterId);
            
            // Find by order for legacy code compatibility
            const chapterOrder = parseInt(lesson.chapterId);
            if (!isNaN(chapterOrder)) {
              const chapterByOrder = createdChapters.find(ch => ch.order === chapterOrder);
              if (chapterByOrder) {
                chapterId = chapterByOrder.id;
                console.log(`Found chapter by order ${chapterOrder}, ID: ${chapterId}`);
              }
            } else {
              // Try to find by temporary ID format from frontend
              // Make sure we have a string to work with
              const chapterId_str = String(lesson.chapterId);
              const chapterMatch = createdChapters.find(ch => 
                chapterId_str.includes(String(ch.order)));
              if (chapterMatch) {
                chapterId = chapterMatch.id;
                console.log(`Found chapter by matching ID pattern, ID: ${chapterId}`);
              }
            }
          }

          // Create resources array if it exists
          const resources = lesson.resources 
            ? lesson.resources.map(resource => ({
                title: resource.title,
                url: resource.url,
                type: resource.type
              }))
            : [];

          console.log('Creating lesson:', {
            title: lesson.title,
            contentPreview: lesson.description?.substring(0, 20) || 'No description',
            videoUrl: lesson.videoUrl,
            chapterId: chapterId,
            resourcesCount: resources.length
          });

          // Create the lesson
          const createdLesson = await prisma.lesson.create({
            data: {
              title: lesson.title,
              content: lesson.description || '',
              videoUrl: lesson.videoUrl,
              order: lesson.order,
              courseId: newCourse.id,
              chapterId: chapterId,
              duration: null, // Setting duration to null (not using it as per requirements)
              // Store resources as JSON in a field called 'resourcesData'
              resourcesData: JSON.stringify(resources)
            }
          });

          console.log('Lesson created successfully:', createdLesson.id);
        } catch (lessonError) {
          console.error('Error creating lesson:', lessonError, 'Lesson data:', {
            title: lesson.title,
            order: lesson.order,
            chapterId: lesson.chapterId
          });
          // Continue to next lesson if this one fails
        }
      }
    } catch (error) {
      console.error('Error creating course content:', error);
      // Consider rolling back the course creation if content creation fails
      await prisma.course.delete({ where: { id: newCourse.id } });
      return NextResponse.json(
        { success: false, error: 'Failed to create course content', details: (error as Error).message },
        { status: 500 }
      );
    }

    // Return the created course
    return NextResponse.json({
      success: true,
      data: newCourse,
      message: "Course created successfully"
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create course', details: (error as Error).message },
      { status: 500 }
    );
  }
});

export const GET = withAdmin(async (req: NextRequest, context: any) => {
  console.log('======= GET ADMIN COURSES API CALLED =======');
  console.log('User:', context.user?.email);
  try {
    console.log('Prisma client:', typeof prisma === 'object' ? 'OK' : 'NOT OK');
    // Parse query params
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const levelParam = url.searchParams.get('level') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('order') || url.searchParams.get('sortOrder');
    const orderDirection = sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    console.log(`======= ADMIN COURSES API CALL (${new Date().toISOString()}) =======`);
    console.log('Request params:', { search, level: levelParam, sortBy, sortOrder, orderDirection, page, limit });
    
    // Build where condition for Prisma
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (levelParam && levelParam !== 'all') {
      where.level = { equals: levelParam.toLowerCase(), mode: 'insensitive' };
    }

    // Build orderBy condition for Prisma
    const orderBy: any = {};
    switch (sortBy) {
      case 'title':
        orderBy.title = orderDirection;
        break;
      case 'price':
        orderBy.price = orderDirection;
        break;
      case 'students':
        orderBy.students = { _count: orderDirection };
        break;
      case 'createdAt':
      default:
        orderBy.createdAt = orderDirection;
    }

    console.log('Executing prisma query with where condition:', where);
    // Get total count for pagination
    let totalItems = 0;
    let totalPages = 0;
    let skip = 0;
    
    try {
      totalItems = await prisma.course.count({ where });
      console.log('Total items count:', totalItems);
      totalPages = Math.ceil(totalItems / limit);
      skip = (page - 1) * limit;
      console.log('Pagination setup - page:', page, 'limit:', limit, 'skip:', skip);
    } catch (countError) {
      console.error('Error counting courses:', countError);
      throw countError;
    }

    // Fetch paginated courses with relations
    console.log('Fetching courses with Prisma...');
    let courses = [];
    try {
      courses = await prisma.course.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              students: true,
              lessons: true
            }
          }
        }
      });
      console.log('Courses fetched successfully, count:', courses.length);
      if (courses.length > 0) {
        console.log('Sample course:', { 
          id: courses[0].id,
          title: courses[0].title,
          fields: Object.keys(courses[0])
        });
      }
    } catch (fetchError) {
      console.error('Error fetching courses:', fetchError);
      throw fetchError;
    }

    // Format response
    console.log('Formatting courses for response...');
    let formattedCourses = [];
    try {
      formattedCourses = courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        level: course.level,
        topics: Array.isArray(course.topics) ? course.topics : [],
        // Đảm bảo imageUrl luôn được chuẩn hóa
        imageUrl: processImageUrl(course.imageUrl),
        studentCount: course._count.students,
        studentsCount: course._count.students, // Thêm alias cho tương thích
        lessonsCount: course._count.lessons,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
      }));
      console.log('Formatted courses successfully, count:', formattedCourses.length);
    } catch (formatError) {
      console.error('Error formatting courses:', formatError);
      // Fallback to minimal format if there's an error
      formattedCourses = courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description || '',
        studentCount: 0,
        studentsCount: 0
      }));
    }

    console.log(`Returning ${formattedCourses.length} courses to client`);
    console.log(`Pagination info: page ${page}/${totalPages}, total items: ${totalItems}`);

    try {
      const response = {
        success: true,
        courses: formattedCourses,
        meta: {
          pagination: {
            page,
            pageSize: limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      };
      console.log('Sending response structure:', Object.keys(response));
      return NextResponse.json(response);
    } catch (responseError) {
      console.error('Error creating response:', responseError);
      return NextResponse.json({
        success: true,
        courses: [],
        error: 'Error formatting response'
      });
    }

  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch courses',
      details: (error as Error).message
    }, { status: 500 });
  }
});