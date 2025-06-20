import prisma from '@/server/db/prisma-client';
import { 
  CourseReferenceLink, 
  CreateCourseReferenceLinkRequest, 
  UpdateCourseReferenceLinkRequest,
  CourseReferenceLinkFilter 
} from '@/shared/types/courses/course-reference-link';

export class CourseReferenceLinkService {
  /**
   * Get all reference links for a course
   */
  static async getCourseReferenceLinks(
    courseId: string, 
    filter: CourseReferenceLinkFilter = {}
  ): Promise<CourseReferenceLink[]> {
    const where: any = {
      courseId,
      ...(filter.isActive !== undefined && { isActive: filter.isActive })
    };

    // Add search functionality
    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
        { url: { contains: filter.search, mode: 'insensitive' } }
      ];
    }

    const courseReferenceLinks = await prisma.courseReferenceLink.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return courseReferenceLinks;
  }

  /**
   * Get a single reference link by ID
   */
  static async getCourseReferenceLinkById(id: string): Promise<CourseReferenceLink | null> {
    const courseReferenceLink = await prisma.courseReferenceLink.findUnique({
      where: { id },
    });

    return courseReferenceLink;
  }

  /**
   * Create a new reference link
   */
  static async createCourseReferenceLink(
    courseId: string,
    data: CreateCourseReferenceLinkRequest
  ): Promise<CourseReferenceLink> {
    // Auto-assign order if not provided
    if (data.order === undefined) {
      const lastLink = await prisma.courseReferenceLink.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' },
      });
      data.order = (lastLink?.order ?? -1) + 1;
    }

    const courseReferenceLink = await prisma.courseReferenceLink.create({
      data: {
        title: data.title,
        url: data.url,
        description: data.description,
        courseId,
        order: data.order,
      },
    });

    return courseReferenceLink;
  }

  /**
   * Update a reference link
   */
  static async updateCourseReferenceLink(
    id: string,
    data: UpdateCourseReferenceLinkRequest
  ): Promise<CourseReferenceLink> {
    const courseReferenceLink = await prisma.courseReferenceLink.update({
      where: { id },
      data,
    });

    return courseReferenceLink;
  }

  /**
   * Delete a reference link
   */
  static async deleteCourseReferenceLink(id: string): Promise<void> {
    await prisma.courseReferenceLink.delete({
      where: { id },
    });
  }

  /**
   * Reorder reference links
   */
  static async reorderCourseReferenceLinks(
    courseId: string,
    linkOrders: { id: string; order: number }[]
  ): Promise<void> {
    // Use transaction to update all orders atomically
    await prisma.$transaction(
      linkOrders.map(({ id, order }) =>
        prisma.courseReferenceLink.update({
          where: { id },
          data: { order },
        })
      )
    );
  }

  /**
   * Toggle active status of a reference link
   */
  static async toggleActiveStatus(id: string): Promise<CourseReferenceLink> {
    const currentLink = await prisma.courseReferenceLink.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!currentLink) {
      throw new Error('Reference link not found');
    }

    const courseReferenceLink = await prisma.courseReferenceLink.update({
      where: { id },
      data: { isActive: !currentLink.isActive },
    });

    return courseReferenceLink;
  }

  /**
   * Get reference links count for a course
   */
  static async getCourseReferenceLinkCount(
    courseId: string,
    filter: CourseReferenceLinkFilter = {}
  ): Promise<number> {
    const where: any = {
      courseId,
      ...(filter.isActive !== undefined && { isActive: filter.isActive })
    };

    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
        { url: { contains: filter.search, mode: 'insensitive' } }
      ];
    }

    const count = await prisma.courseReferenceLink.count({ where });
    return count;
  }

  /**
   * Validate if URL is accessible (optional utility method)
   */
  static async validateUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}