import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth/auth-middleware';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/roles';
import { v4 as uuidv4 } from 'uuid';

// Schema for course validation
const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0, "Price must be a positive number"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  topics: z.array(z.string()),
  videoUrl: z.string().url("Must be a valid URL").optional(),
  imageUrl: z.string().url("Must be a valid URL").optional(),
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
      title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
      description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
      imageUrl: z.string().url({ message: 'Please provide a valid URL for image' }).optional(),
      price: z.number().nonnegative({ message: 'Price must be a positive number' }),
      level: z.enum(['beginner', 'intermediate', 'advanced']),
      topics: z.array(z.string()),
      videoUrl: z.string().url({ message: 'Please provide a valid URL for video' }).optional(),
    });

    const body = await req.json();
    const validationResult = CourseSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid course data', details: validationResult.error.format() },
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
        instructorId: user.id,
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
    
    // Find all courses created by the admin using Prisma
    const courses = await prisma.course.findMany({
      where: {
        instructorId: user.id
      },
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