import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db/prisma-client';
import { withAdmin } from '@/server/api/route-handlers';
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
  title: z.string().min(1, 'Chapter title is required'),
  description: z.string().optional(),
  order: z.number().int().min(1, 'Order must be a positive integer')
});

// Schema for resource validation
const resourceSchema = z.object({
  title: z.string().min(1, 'Resource title is required'),
  url: z.string(),
  type: z.string()
});

// Schema for lesson validation
const lessonSchema = z.object({
  title: z.string().min(1, 'Lesson title is required'),
  description: z.string().optional().default(''),
  order: z.number().int().min(1, 'Order must be a positive integer'),
  videoUrl: z.string().optional(),
  chapterId: z.string().optional(),
  resources: z.array(resourceSchema).optional().default([])
});

// Schema for published course validation
const publishedCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description must be at least 1 characters'),
  price: z.number().min(0, 'Price must be a positive number'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all']),
  topics: z.array(z.string()),
  status: z.literal('published'),
  videoUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  chapters: z.array(chapterSchema).min(1, 'At least one chapter is required'),
  lessons: z.array(lessonSchema).min(1, 'At least one lesson is required'),
  slug: z.string().optional()
});

// Schema for draft course validation
const draftCourseSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be a positive number').optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all']).optional(),
  topics: z.array(z.string()).optional(),
  status: z.literal('draft'),
  videoUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  chapters: z.array(chapterSchema).optional(),
  lessons: z.array(lessonSchema).optional(),
  slug: z.string().optional()
});

// Combined course schema
const courseSchema = z.discriminatedUnion('status', [
  publishedCourseSchema,
  draftCourseSchema
]);

// Define valid level values exactly as they are stored in the database
const VALID_LEVEL_VALUES = ['beginner', 'intermediate', 'advanced', 'all'];

// POST - Create a new course
export const POST = withAdmin(async (req: Request, context) => {
  try {
    console.log('Admin user creating course:', context.user.email);
    
    // Validate body
    const body = await req.json();
    console.log('Request body:', body);
    
    // Determine if this is a draft or published course
    const status = body.status || 'draft';
    
    // Convert 'all' level to 'beginner' to match the database schema if level is provided
    if (body.level === 'all') {
      body.level = 'beginner';
    }
    
    // Generate auto title for draft if not provided or is default title
    if (!body.title || body.title.trim() === '') {
      // Format ngày hiện tại
      const today = new Date();
      const dateStr = `${today.getDate().toString().padStart(2, '0')}${
        (today.getMonth() + 1).toString().padStart(2, '0')}${
        today.getFullYear()}`;
      
      try {
        // Tìm khóa học nháp trong ngày
        const todayDrafts = await prisma.course.findMany({
          where: {
            title: { contains: `-${dateStr}` },
            status: 'draft'
          }
        });
        
        // Filter format chuẩn và tìm số lớn nhất
        const untitledPattern = new RegExp(`^Untitled-(\\d+)-${dateStr}$`);
        let maxSequence = 0;
        
        todayDrafts.forEach(draft => {
          const match = draft.title.match(untitledPattern);
          if (match && match[1]) {
            const sequence = parseInt(match[1]);
            if (sequence > maxSequence) {
              maxSequence = sequence;
            }
          }
        });
        
        // Tạo tiêu đề mới
        body.title = `Untitled-${maxSequence + 1}-${dateStr}`;
        
        console.log(`Created new draft course with title: ${body.title}`);
        
      } catch (error) {
        console.error('Error finding draft courses:', error);
        // Fallback với timestamp
        const timestamp = Date.now();
        body.title = `Untitled-1-${dateStr}-${timestamp}`;
      }
    }
    
    // Apply different validation based on status
    let validationResult;
    
    if (status === 'published') {
      validationResult = publishedCourseSchema.safeParse(body);
    } else {
      validationResult = draftCourseSchema.safeParse(body);
    }

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

    const validatedData = validationResult.data;
    
    // Set default values for draft courses
    const title = validatedData.title || body.title || '';
    const description = validatedData.description || '';
    const price = validatedData.price || 0;
    const level = validatedData.level || 'beginner';
    const topics = validatedData.topics || [];
    const imageUrl = validatedData.imageUrl || null;
    const videoUrl = validatedData.videoUrl || null;
    
    // Generate a slug from the title
    const slug = title.toLowerCase().replace(/\s+/g, '-') + '-' + uuidv4().substring(0, 8);

    // Extract chapters and lessons from the validated data
    const chapters = validatedData.chapters || [];
    const lessons = validatedData.lessons || [];

    // Từ mảng tên topic, tìm (hoặc tạo) các Topic trong DB
    const topicObjects = await Promise.all(
      topics.map(async (topicName: any) => {
        // Tìm topic theo tên
        let topic = await prisma.topic.findFirst({
          where: { name: { equals: topicName } }
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
    let newCourse;
    try {
      newCourse = await prisma.course.create({
        data: {
          title,
          description,
          imageUrl: processImageUrl(imageUrl),
          price,
          level,
          // @ts-ignore - Status field exists in the database schema but TypeScript doesn't recognize it yet
          status: status as 'draft' | 'published',
          topics: topics, // Giữ lại để tương thích ngược
          topicIds: topicIds, // Liên kết với các Topic thực sự
          studentIds: [],
        }
      });
    } catch (createError: any) {
      console.error('Error creating course:', createError);
      throw createError;
    }

    // Check if course was created successfully
    if (!newCourse) {
      return NextResponse.json(
        { success: false, error: 'Failed to create course' },
        { status: 500 }
      );
    }

    // Only create chapters and lessons if they exist (for published courses)
    if (chapters.length > 0 || lessons.length > 0) {
      try {
        // Create chapters first
        console.log('Creating chapters:', chapters.length);
        const createdChapters: any[] = [];
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
          } catch (chapterError: unknown) {
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
          } catch (lessonError: unknown) {
            console.error('Error creating lesson:', lessonError, 'Lesson data:', {
              title: lesson.title,
              order: lesson.order,
              chapterId: lesson.chapterId
            });
            // Continue to next lesson if this one fails
          }
        }
      } catch (error: unknown) {
        console.error('Error creating course content:', error);
        // Consider rolling back the course creation if content creation fails
        await prisma.course.delete({ where: { id: newCourse.id } });
        return NextResponse.json(
          { success: false, error: 'Failed to create course content', details: (error as Error).message },
          { status: 500 }
        );
      }
    }

    // Return the created course
    return NextResponse.json({
      success: true,
      data: newCourse,
      message: 'Course created successfully'
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create course', details: (error as Error).message },
      { status: 500 }
    );
  }
});

export const GET = withAdmin(async (req: NextRequest, context) => {
  console.log('======= GET ADMIN COURSES API CALLED =======');
  console.log('User:', context.user?.email);
  try {
    console.log('Prisma client:', typeof prisma === 'object' ? 'OK' : 'NOT OK');
    // Parse query params
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const levelParam = url.searchParams.get('level') || '';
    const statusParam = url.searchParams.get('status') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('order') || url.searchParams.get('sortOrder');
    const orderDirection = sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    console.log(`======= ADMIN COURSES API CALL (${new Date().toISOString()}) =======`);
    console.log('Request params:', { search, level: levelParam, status: statusParam, sortBy, sortOrder, orderDirection, page, limit });
    
    // Build where condition for Prisma
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }
    
    if (levelParam && levelParam !== 'all') {
      where.level = { equals: levelParam.toLowerCase() };
    }
    
    // Filter by status if provided
    if (statusParam && statusParam !== 'all') {
      where.status = { equals: statusParam };
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
    } catch (countError: unknown) {
      console.error('Error counting courses:', countError);
      throw countError;
    }

    // Fetch paginated courses with relations
    console.log('Fetching courses with Prisma...');
    let courses: any[] = [];
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
        console.log('First course:', courses[0].title);
      }
    } catch (fetchError: unknown) {
      console.error('Error fetching courses:', fetchError);
      throw fetchError;
    }

    // Format courses for response
    console.log('Formatting courses for response...');
    let formattedCourses: any[] = [];
    try {
      formattedCourses = courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        level: course.level,
        topics: course.topics,
        imageUrl: processImageUrl(course.imageUrl),
        studentCount: course._count?.students || 0,
        studentsCount: course._count?.students || 0,
        lessonsCount: course._count?.lessons || 0,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        status: course.status || 'published'
      }));
      // Nếu sortBy là 'title', sort lại ở tầng Node.js để không phân biệt hoa/thường
      if (sortBy === 'title') {
        formattedCourses.sort((a, b) => {
          return orderDirection === 'asc'
            ? (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' })
            : (b.title || '').localeCompare(a.title || '', undefined, { sensitivity: 'base' });
        });
      }
      console.log('Formatted courses successfully, count:', formattedCourses.length);
    } catch (formatError: unknown) {
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

    // Return simplified list if there are too many courses
    console.log('Returning simplified course list...');
    const simplified: any[] = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      studentCount: course._count?.students || 0,
      studentsCount: course._count?.students || 0
    }));

    console.log(`Returning ${formattedCourses.length} courses to client`);
    // Add debug log for the first course status
    if (formattedCourses.length > 0) {
      console.log(`First course status: ${formattedCourses[0].status}`);
    }
    console.log(`Pagination info: page ${page}/${totalPages}, total items: ${totalItems}`);

    return NextResponse.json({
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
    });
  } catch (error: unknown) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch courses',
      details: (error as Error).message
    }, { status: 500 });
  }
});