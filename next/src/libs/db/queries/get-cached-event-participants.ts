'server-only';
import prisma from '@/libs/db/prisma';
import { unstable_cache } from 'next/cache';

export const getCachedEventParticipants = unstable_cache(
  async (eventDocumentId: string) => {
    const res = await prisma.eventRegistration.findMany({
      where: {
        eventDocumentId,
        deletedAt: null,
        paymentCompleted: true,
        event: {
          endDate: {
            gte: new Date(),
          },
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
      distinct: ['entraUserUuid'],
    });

    return res;
  },
  ['get-cached-event-participants'],
  {
    revalidate: 60,
  },
);
