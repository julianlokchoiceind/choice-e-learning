import prisma from '@/server/db/prisma-client';
import { 
  ReferenceLink, 
  CreateReferenceLinkRequest, 
  UpdateReferenceLinkRequest,
  ReferenceLinkFilter 
} from '@/shared/types/courses/reference-link';

export class ReferenceLinkService {
  /**
   * Get all reference links for a course
   */
  static async getReferenceLinks(
    courseId: string, 
    filter: ReferenceLinkFilter = {}
  ): Promise<ReferenceLink[]> {
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

    const referenceLinks = await prisma.referenceLink.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return referenceLinks;
  }

  /**
   * Get a single reference link by ID
   */
  static async getReferenceLinkById(id: string): Promise<ReferenceLink | null> {
    const referenceLink = await prisma.referenceLink.findUnique({
      where: { id },
    });

    return referenceLink;
  }

  /**
   * Create a new reference link
   */
  static async createReferenceLink(
    courseId: string,
    data: CreateReferenceLinkRequest
  ): Promise<ReferenceLink> {
    // Auto-assign order if not provided
    if (data.order === undefined) {
      const lastLink = await prisma.referenceLink.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' },
      });
      data.order = (lastLink?.order ?? -1) + 1;
    }

    const referenceLink = await prisma.referenceLink.create({
      data: {
        title: data.title,
        url: data.url,
        description: data.description,
        courseId,
        order: data.order,
      },
    });

    return referenceLink;
  }

  /**
   * Update a reference link
   */
  static async updateReferenceLink(
    id: string,
    data: UpdateReferenceLinkRequest
  ): Promise<ReferenceLink> {
    const referenceLink = await prisma.referenceLink.update({
      where: { id },
      data,
    });

    return referenceLink;
  }

  /**
   * Delete a reference link
   */
  static async deleteReferenceLink(id: string): Promise<void> {
    await prisma.referenceLink.delete({
      where: { id },
    });
  }

  /**
   * Reorder reference links
   */
  static async reorderReferenceLinks(
    courseId: string,
    linkOrders: { id: string; order: number }[]
  ): Promise<void> {
    // Use transaction to update all orders atomically
    await prisma.$transaction(
      linkOrders.map(({ id, order }) =>
        prisma.referenceLink.update({
          where: { id },
          data: { order },
        })
      )
    );
  }

  /**
   * Toggle active status of a reference link
   */
  static async toggleActiveStatus(id: string): Promise<ReferenceLink> {
    const currentLink = await prisma.referenceLink.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!currentLink) {
      throw new Error('Reference link not found');
    }

    const referenceLink = await prisma.referenceLink.update({
      where: { id },
      data: { isActive: !currentLink.isActive },
    });

    return referenceLink;
  }

  /**
   * Get reference links count for a course
   */
  static async getReferenceLinkCount(
    courseId: string,
    filter: ReferenceLinkFilter = {}
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

    const count = await prisma.referenceLink.count({ where });
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