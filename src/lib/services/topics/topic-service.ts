/**
 * Topic Service
 * Provides functionalities to manage topics for courses
 */

import prismaInstance from '@/lib/db/prisma-client';
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
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Extend PrismaClient with topic property
interface ExtendedPrismaClient {
  topic: any;
  course: any;
}

// Type for topic relation
interface TopicRelation {
  id: string;
  name?: string;
  [key: string]: any;
}

// Using CreateTopicParams and UpdateTopicParams from @/types/topics

/**
 * Topic Service Implementation
 */
class TopicService {
  private prisma: ExtendedPrismaClient;

  constructor() {
    // Cast prismaInstance to our extended type
    this.prisma = prismaInstance as unknown as ExtendedPrismaClient;
  }

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

    try {
      console.log('Getting all topics with filters:', filters);
      
      // Build where conditions for filtering
      const where: any = {};

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
      const total = await this.prisma.topic.count({ where });

      // Calculate pagination values
      const skip = (page - 1) * limit;
      const take = limit;
      const totalPages = Math.ceil(total / limit) || 1;

      // Create sort object
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      // Fetch topics with pagination and sorting
      const topics = await this.prisma.topic.findMany({
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

      console.log(`Found ${topics.length} topics`);

      // Return topics with pagination metadata
      return {
        data: topics as Topic[],
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Error in getAllTopics:', error);
      // Return empty result on error
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: page > 1
        }
      };
    }
  }

  /**
   * Get all active topics (no pagination)
   */
  async getAllActiveTopics(): Promise<Topic[]> {
    try {
      return await this.prisma.topic.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      console.error('Error in getAllActiveTopics:', error);
      return [];
    }
  }

  /**
   * Get a single topic by ID
   */
  async getTopicById(id: string): Promise<Topic | null> {
    try {
      return await this.prisma.topic.findUnique({
        where: { id },
        include: {
          _count: {
            select: { 
              courses: true 
            }
          },
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
    } catch (error) {
      console.error(`Error in getTopicById for id ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Create a new topic
   */
  async createTopic(data: CreateTopicParams): Promise<Topic> {
    try {
      console.log('CreateTopic service called with data:', JSON.stringify(data));
      
      // Kiểm tra dữ liệu đầu vào
      if (!data || !data.name || typeof data.name !== 'string') {
        console.error('Invalid topic data or name:', data);
        throw new Error('Topic name is required and must be a string');
      }
      
      // Normalize data
      const cleanData = {
        name: data.name.trim(),
        description: data.description?.trim() || '',
        isActive: data.isActive ?? true
      };
      
      console.log('Normalized data:', cleanData);
      
      if (cleanData.name.length === 0) {
        throw new Error('Topic name cannot be empty');
      }
      
      // Tạo slug từ name
      let slug = '';
      try {
        slug = slugify(cleanData.name);
        
        // Ensure slug is not empty
        if (!slug || slug.length === 0) {
          // Fallback nếu slugify trả về chuỗi rỗng
          console.warn('Empty slug generated, using fallback method');
          slug = cleanData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          
          // If still empty, use timestamp
          if (!slug || slug.length === 0) {
            slug = `topic-${Date.now()}`;
            console.warn('Using timestamp slug as fallback:', slug);
          }
        }
        
        console.log('Generated slug:', slug);
      } catch (slugError) {
        console.error('Error generating slug:', slugError);
        // Tạo slug an toàn theo cách thủ công
        slug = `topic-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        console.log('Using emergency fallback slug:', slug);
      }
      
      // Check if slug or name already exists (case insensitive)
      console.log('Checking for existing topic with same name/slug');
      const existingTopic = await this.prisma.topic.findFirst({
        where: { 
          OR: [
            { slug: { equals: slug, mode: 'insensitive' } },
            { name: { equals: cleanData.name, mode: 'insensitive' } }
          ]
        }
      });
      
      if (existingTopic) {
        console.log('Found existing topic:', existingTopic);
        throw new Error(`Topic with name "${cleanData.name}" already exists`);
      }
      console.log('No existing topic found with the same name/slug');
      
      // Create the topic data object - must match Prisma schema
      const createData = {
        name: cleanData.name,
        description: cleanData.description,
        isActive: cleanData.isActive,
        slug,
        courseIds: [] // Initialize with empty array to match schema
      };
      
      console.log('Final data for database insert:', createData);
      
      // Create the new topic
      try {
        console.log('Attempting to create topic in database...');
        const newTopic = await this.prisma.topic.create({
          data: createData
        });
        
        console.log('Topic created successfully:', newTopic);
        return newTopic;
      } catch (dbError: any) {
        console.error('Database error creating topic:', dbError);
        
        // Xử lý lỗi Prisma chi tiết hơn
        if (dbError.code === 'P2002') {
          // Lỗi trùng unique, tạo thông báo rõ ràng hơn
          const target = dbError.meta?.target || [];
          if (target.includes('name')) {
            throw new Error(`Topic with name "${cleanData.name}" already exists`);
          } else if (target.includes('slug')) {
            throw new Error(`Topic with slug "${slug}" already exists`);
          } else {
            throw new Error(`Topic with the same unique value already exists`);
          }
        }
        
        // Lỗi khác
        throw new Error(`Database error: ${dbError.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error in createTopic service:', error);
      throw error;
    }
  }

  /**
   * Update an existing topic
   */
  async updateTopic(id: string, data: UpdateTopicParams): Promise<Topic> {
    try {
      const updateData: any = { ...data };
      
      // If name is being updated, also update the slug
      if (data.name) {
        const slug = slugify(data.name);
        
        // Check if slug already exists (excluding this topic)
        const existingTopic = await this.prisma.topic.findFirst({
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
      
      // Update the topic
      return await this.prisma.topic.update({
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
    } catch (error) {
      console.error(`Error in updateTopic for id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a topic
   */
  async deleteTopic(id: string): Promise<Topic> {
    try {
      // Check if the topic is associated with any courses
      const topic = await this.prisma.topic.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              courses: true
            }
          }
        }
      });
      
      if (!topic) {
        throw new Error('Topic not found');
      }
      
      if (topic._count?.courses && topic._count.courses > 0) {
        throw new Error(`Cannot delete topic that is associated with ${topic._count.courses} courses`);
      }
      
      // Delete the topic
      return await this.prisma.topic.delete({
        where: { id }
      });
    } catch (error) {
      console.error(`Error in deleteTopic for id ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Add a topic to a course
   */
  async addTopicToCourse(topicId: string, courseId: string): Promise<void> {
    try {
      console.log(`Adding topic ${topicId} to course ${courseId}`);
      
      // Check if the topic and course exist
      const topic = await this.prisma.topic.findUnique({ 
        where: { id: topicId } 
      });
      
      const course = await this.prisma.course.findUnique({ 
        where: { id: courseId },
        include: {
          topicsList: true
        }
      });
      
      if (!topic || !course) {
        throw new Error('Topic or course not found');
      }
      
      // Check if the topic is already connected to the course
      const isTopicAlreadyConnected = course.topicsList.some((t: TopicRelation) => t.id === topicId);
      
      if (isTopicAlreadyConnected) {
        console.log(`Topic ${topicId} is already added to course ${courseId}`);
        return;
      }
      
      // Add the topic to the course using Prisma connect
      await this.prisma.course.update({
        where: { id: courseId },
        data: {
          topicsList: {
            connect: { id: topicId }
          },
          // Also update the topics array for backward compatibility
          topics: {
            push: topic.name
          }
        }
      });
      
      console.log(`Topic ${topicId} successfully added to course ${courseId}`);
    } catch (error) {
      console.error(`Error in addTopicToCourse for topicId=${topicId}, courseId=${courseId}:`, error);
      throw error;
    }
  }
  
  /**
   * Remove a topic from a course
   */
  async removeTopicFromCourse(topicId: string, courseId: string): Promise<void> {
    try {
      console.log(`Removing topic ${topicId} from course ${courseId}`);
      
      // Check if the topic and course exist
      const topic = await this.prisma.topic.findUnique({ 
        where: { id: topicId } 
      });
      
      const course = await this.prisma.course.findUnique({ 
        where: { id: courseId },
        include: {
          topicsList: true
        }
      });
      
      if (!topic || !course) {
        throw new Error('Topic or course not found');
      }
      
      // Check if topic is actually connected to this course
      const isConnected = course.topicsList.some((t: TopicRelation) => t.id === topicId);
      
      if (!isConnected) {
        console.log(`Topic ${topicId} is not connected to course ${courseId}`);
        return;
      }
      
      // Get current topics array and filter out the topic name
      const updatedTopics = course.topics.filter((t: string) => t !== topic.name);
      
      // Remove the topic from the course
      await this.prisma.course.update({
        where: { id: courseId },
        data: {
          topicsList: {
            disconnect: { id: topicId }
          },
          // Also update the topics array for backward compatibility
          topics: updatedTopics
        }
      });
      
      console.log(`Topic ${topicId} successfully removed from course ${courseId}`);
    } catch (error) {
      console.error(`Error in removeTopicFromCourse for topicId=${topicId}, courseId=${courseId}:`, error);
      throw error;
    }
  }
}

export const topicService = new TopicService();
