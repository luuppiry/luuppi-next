'server-only';
import prisma from '@/libs/db/prisma';
import { cacheLife, cacheTag } from 'next/cache';

export const getCachedEventParticipants = async (eventDocumentId: string) => {
  'use cache';
  cacheLife('minutes');
  cacheTag(`get-cached-event-participants:${eventDocumentId}`);

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
};
