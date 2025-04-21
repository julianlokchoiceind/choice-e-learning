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
  lessons: z.array(lessonSchema)
});

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

    // Create the course with Prisma
    const newCourse = await prisma.course.create({
      data: {
        title,
        description,
        slug,
        imageUrl: imageUrl || '/images/course-default.jpg',
        price,
        level,
        topics,
        videoUrl,
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
                const chapterMatch = createdChapters.find(ch => 
                  lesson.chapterId.includes(String(ch.order)));
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

// GET - Get all courses (admin view)
export async function GET(req: Request) {
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
    
    // Find all courses using Prisma
    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: {
            students: true,
            lessons: true
          }
        }
      }
    });
    
    // Format the courses for response
    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      level: course.level,
      topics: course.topics,
      imageUrl: course.imageUrl,
      studentsCount: course._count.students,
      lessonsCount: course._count.lessons,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    }));
    
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