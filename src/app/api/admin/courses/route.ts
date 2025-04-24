import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth/auth-middleware';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/roles';
import { v4 as uuidv4 } from 'uuid';

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
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    // Thêm các dòng log này
    console.log('Current user:', user);
    console.log('Current user role:', user?.role);
    console.log('Is user admin?', isAdmin(user));
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: 'Forbidden. Only admins can create courses.' },
        { status: 403 }
      );
    }
    
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
        imageUrl: imageUrl || '/images/course-default.jpg',
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
        { error: 'Failed to create course' },
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
          { error: 'Failed to create course content', details: (error as Error).message },
          { status: 500 }
        );
      }

    // Return the created course
    return NextResponse.json({
      success: true,
      course: newCourse
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course', details: (error as Error).message },
      { status: 500 }
    );
  }
}

  export async function GET(req: NextRequest) {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized. Please login.' },
          { status: 401 }
        );
      }

      if (!isAdmin(user)) {
        return NextResponse.json(
          { error: 'Forbidden. Only admins can view courses.' },
          { status: 403 }
        );
      }
      
      // Parse query params
      const url = new URL(req.url);
      const search = url.searchParams.get('search') || '';
      const levelParam = url.searchParams.get('level') || '';
      const sortBy = url.searchParams.get('sortBy') || 'createdAt';
      const sortOrder = url.searchParams.get('sortOrder')?.toLowerCase() === 'asc' ? 'asc' : 'desc';
      
      // Log request params for debugging
      console.log(`======= ADMIN COURSES API CALL (${new Date().toISOString()}) =======`);
      console.log('Request params:', { search, level: levelParam, sortBy, sortOrder });
      
      // Lấy tất cả khóa học từ database
      // Filter sẽ được áp dụng sau khi nhận dữ liệu
      console.log('Executing base Prisma query...');
      
      const allCourses = await prisma.course.findMany({
        include: {
          _count: {
            select: {
              students: true,
              lessons: true
            }
          },
          topicsList: true
        }
      });
      
      console.log(`Retrieved ${allCourses.length} courses from database`);
      console.log('All course levels in database:', allCourses.map(c => c.level));
      
      // Lọc dữ liệu trong memory - cách này đảm bảo tính nhất quán
      let filteredCourses = [...allCourses]; // Clone to avoid reference issues
      
      // Áp dụng filter tìm kiếm nếu có
      if (search && search.trim() !== '') {
        const searchLower = search.toLowerCase().trim();
        console.log(`Applying search filter: "${searchLower}"`);
        
        filteredCourses = filteredCourses.filter(course => 
          course.title.toLowerCase().includes(searchLower) || 
          course.description.toLowerCase().includes(searchLower)
        );
        
        console.log(`After search filter: ${filteredCourses.length} courses remain`);
      }
      
      // Áp dụng filter level
      if (levelParam && levelParam.trim() !== '' && levelParam !== 'all') {
        const levelLower = levelParam.toLowerCase().trim();
        console.log(`Applying level filter: "${levelLower}"`);
        
        // Sử dụng filter trong memory với case-insensitive comparison
        filteredCourses = filteredCourses.filter(course => {
          const courseLevel = course.level?.toLowerCase() || '';
          const matches = courseLevel === levelLower;
          
          console.log(`Course "${course.title}" (${course.id}) - level="${course.level}" | matches=${matches}`);
          
          return matches;
        });
        
        console.log(`After level filter: ${filteredCourses.length} courses remain`);
      } else {
        console.log('No level filter applied (showing all levels)');
      }
      
      // Áp dụng sắp xếp
      console.log(`Applying sort: ${sortBy} ${sortOrder}`);
      
      filteredCourses.sort((a, b) => {
        let valueA, valueB;
        
        // Xác định các giá trị cần so sánh dựa trên trường sortBy
        switch (sortBy) {
          case 'title':
            valueA = a.title.toLowerCase();
            valueB = b.title.toLowerCase();
            return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
          
          case 'price':
            valueA = a.price || 0;
            valueB = b.price || 0;
            return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
          
          case 'students':
            valueA = a._count?.students || 0;
            valueB = b._count?.students || 0;
            return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
            
          case 'createdAt':
          default:
            valueA = new Date(a.createdAt).getTime();
            valueB = new Date(b.createdAt).getTime();
            return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
        }
      });
      
      // Format kết quả để trả về
      const formattedCourses = filteredCourses.map(course => {
        const legacyTopics = Array.isArray(course.topics) ? course.topics : [];
        const relationTopics = Array.isArray(course.topicsList) 
          ? course.topicsList.map(topic => ({
              id: topic.id,
              name: topic.name,
              slug: topic.slug,
              isActive: topic.isActive
            }))
          : [];
        
        // Log individual course data for verification
        console.log(`Formatted course: "${course.title}" - level="${course.level}"`);
        
        return {
          id: course.id,
          title: course.title,
          description: course.description,
          price: course.price,
          level: course.level,
          topics: legacyTopics,
          topicsList: relationTopics,
          imageUrl: course.imageUrl,
          studentsCount: course._count.students,
          lessonsCount: course._count.lessons,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt
        };
      });
      
      console.log(`Returning ${formattedCourses.length} courses to client`);
      console.log(`======= END API CALL =======`);
      
      return NextResponse.json({
        success: true,
        courses: formattedCourses
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch courses', details: (error as Error).message },
        { status: 500 }
      );
    }
  } 