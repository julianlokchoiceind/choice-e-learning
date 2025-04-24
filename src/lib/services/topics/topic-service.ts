/**
 * Topic Service
 * Provides functionalities to manage topics for courses
 */

import prismaInstance from '@/lib/db/prisma-client';
import { Prisma } from '@prisma/client';
import { Topic, TopicFilter, CreateTopicParams, UpdateTopicParams } from '@/types/topics';
import { slugify } from '@/lib/utils/string-utils';

// Using TopicFilter from @/types/topics

export interface TopicPaginatedResult {
  data: Topic[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Using CreateTopicParams and UpdateTopicParams from @/types/topics

/**
 * Topic Service Implementation
 */
class TopicService {
  /**
   * Get all topics with filtering and pagination
   */
  async getAllTopics(filters: TopicFilter = {}): Promise<TopicPaginatedResult> {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      isActive
    } = filters;

    // Build where conditions for filtering
    const where: Prisma.TopicWhereInput = {};

    // Apply search filter if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Apply active filter if provided
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Count total topics matching the criteria
    const total = await prismaInstance.topic.count({ where });

    // Calculate pagination values
    const skip = (page - 1) * limit;
    const take = limit;
    const totalPages = Math.ceil(total / limit) || 1;

    // Create sort object
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Fetch topics with pagination and sorting
    const topics = await prismaInstance.topic.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        _count: {
          select: {
            courses: true
          }
        }
      }
    });

    // Return topics with pagination metadata
    return {
      data: topics,
      meta: {
        total,
        page,
        limit,
        totalPages
      }
    };
  }

  /**
   * Get all active topics (no pagination)
   */
  async getAllActiveTopics(): Promise<Topic[]> {
    return prismaInstance.topic.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Get a single topic by ID
   */
  async getTopicById(id: string): Promise<Topic | null> {
    return prismaInstance.topic.findUnique({
      where: { id },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            level: true,
            imageUrl: true
          }
        }
      }
    });
  }
  
  /**
   * Create a new topic
   */
  async createTopic(data: CreateTopicParams): Promise<Topic> {
    const slug = slugify(data.name);
    
    // Check if slug already exists
    const existingTopic = await prismaInstance.topic.findFirst({
      where: { 
        OR: [
          { slug },
          { name: { equals: data.name, mode: 'insensitive' } }
        ]
      }
    });
    
    if (existingTopic) {
      throw new Error(`Topic with name "${data.name}" already exists`);
    }
    
    return prismaInstance.topic.create({
      data: {
        ...data,
        slug,
        courseIds: []
      }
    });
  }

  /**
   * Update an existing topic
   */
  async updateTopic(id: string, data: UpdateTopicParams): Promise<Topic> {
    const updateData: any = { ...data };
    
    // If name is being updated, also update the slug
    if (data.name) {
      const slug = slugify(data.name);
      
      // Check if slug already exists (excluding this topic)
      const existingTopic = await prismaInstance.topic.findFirst({
        where: { 
          AND: [
            { NOT: { id } },
            { 
              OR: [
                { slug },
                { name: { equals: data.name, mode: 'insensitive' } }
              ]
            }
          ]
        }
      });
      
      if (existingTopic) {
        throw new Error(`Topic with name "${data.name}" already exists`);
      }
      
      updateData.slug = slug;
    }
    
    return prismaInstance.topic.update({
      where: { id },
      data: updateData,
      include: {
        courses: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
  }

  /**
   * Delete a topic
   */
  async deleteTopic(id: string): Promise<Topic> {
    // Check if the topic is associated with any courses
    const topic = await prismaInstance.topic.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            courses: true
          }
        }
      }
    });
    
    if (topic && topic._count.courses > 0) {
      throw new Error(`Cannot delete topic that is associated with ${topic._count.courses} courses`);
    }
    
    return prismaInstance.topic.delete({
      where: { id }
    });
  }
  
  /**
   * Add a topic to a course
   */
  async addTopicToCourse(topicId: string, courseId: string): Promise<void> {
    // Check if the topic and course exist
    const topic = await prismaInstance.topic.findUnique({ where: { id: topicId } });
    const course = await prismaInstance.course.findUnique({ where: { id: courseId } });
    
    if (!topic || !course) {
      throw new Error('Topic or course not found');
    }
    
    // Update the course's topics list
    await prismaInstance.course.update({
      where: { id: courseId },
      data: {
        topicsList: {
          connect: { id: topicId }
        }
      }
    });
    
    // Also update the course's topics array for backward compatibility
    await prismaInstance.course.update({
      where: { id: courseId },
      data: {
        topics: {
          push: topic.name
        }
      }
    });
  }
  
  /**
   * Remove a topic from a course
   */
  async removeTopicFromCourse(topicId: string, courseId: string): Promise<void> {
    // Check if the topic and course exist
    const topic = await prismaInstance.topic.findUnique({ where: { id: topicId } });
    const course = await prismaInstance.course.findUnique({ 
      where: { id: courseId },
      include: { topicsList: true }
    });
    
    if (!topic || !course) {
      throw new Error('Topic or course not found');
    }
    
    // Update the course's topics list
    await prismaInstance.course.update({
      where: { id: courseId },
      data: {
        topicsList: {
          disconnect: { id: topicId }
        }
      }
    });
    
    // Also update the course's topics array for backward compatibility
    const updatedTopics = course.topics.filter(t => t !== topic.name);
    await prismaInstance.course.update({
      where: { id: courseId },
      data: {
        topics: updatedTopics
      }
    });
  }
}

export const topicService = new TopicService();
