import prisma from '@/server/db/prisma-client';

export interface LessonReferenceLink {
  id: string;
  title: string;
  url: string;
  description?: string | null;
  lessonId: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLessonReferenceLinkData {
  title: string;
  url: string;
  description?: string;
  order?: number;
}

export interface UpdateLessonReferenceLinkData {
  title?: string;
  url?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export class LessonReferenceLinkService {
  /**
   * Get all reference links for a lesson
   */
  static async getLessonReferenceLinks(lessonId: string): Promise<LessonReferenceLink[]> {
    const links = await prisma.lessonReferenceLink.findMany({
      where: { 
        lessonId,
        isActive: true 
      },
      orderBy: { order: 'asc' },
    });

    return links;
  }

  /**
   * Get a single lesson reference link by ID
   */
  static async getLessonReferenceLinkById(id: string): Promise<LessonReferenceLink | null> {
    const link = await prisma.lessonReferenceLink.findUnique({
      where: { id },
    });

    return link;
  }

  /**
   * Create a new lesson reference link
   */
  static async createLessonReferenceLink(
    lessonId: string,
    data: CreateLessonReferenceLinkData
  ): Promise<LessonReferenceLink> {
    // Auto-assign order if not provided
    if (data.order === undefined) {
      const lastLink = await prisma.lessonReferenceLink.findFirst({
        where: { lessonId },
        orderBy: { order: 'desc' },
      });
      data.order = (lastLink?.order ?? -1) + 1;
    }

    const link = await prisma.lessonReferenceLink.create({
      data: {
        title: data.title,
        url: data.url,
        description: data.description,
        lessonId,
        order: data.order,
      },
    });

    return link;
  }

  /**
   * Update a lesson reference link
   */
  static async updateLessonReferenceLink(
    id: string,
    data: UpdateLessonReferenceLinkData
  ): Promise<LessonReferenceLink> {
    const link = await prisma.lessonReferenceLink.update({
      where: { id },
      data,
    });

    return link;
  }

  /**
   * Delete a lesson reference link
   */
  static async deleteLessonReferenceLink(id: string): Promise<void> {
    await prisma.lessonReferenceLink.delete({
      where: { id },
    });
  }

  /**
   * Reorder lesson reference links
   */
  static async reorderLessonReferenceLinks(
    lessonId: string,
    linkOrders: { id: string; order: number }[]
  ): Promise<void> {
    // Use transaction to update all orders atomically
    await prisma.$transaction(
      linkOrders.map(({ id, order }) =>
        prisma.lessonReferenceLink.update({
          where: { id },
          data: { order },
        })
      )
    );
  }
}