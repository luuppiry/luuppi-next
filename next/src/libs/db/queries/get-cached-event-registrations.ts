'server-only';
import prisma from '@/libs/db/prisma';
import { cacheLife, cacheTag } from 'next/cache';

export const getCachedEventRegistrations = async (eventDocumentId: string) => {
  'use cache';
  cacheLife('minutes');
  cacheTag(`get-cached-event-registrations:${eventDocumentId}`);

  const res = await prisma.eventRegistration.findMany({
    where: {
      eventDocumentId,
      deletedAt: null,
      OR: [
        {
          reservedUntil: {
            gte: new Date(),
          },
        },
        {
          paymentCompleted: true,
        },
        {
          paymentCompleted: false,
          payments: {
            some: {
              status: 'PENDING',
            },
          },
        },
      ],
    },
    select: {
      entraUserUuid: true,
      paymentCompleted: true,
      purchaseRole: {
        select: {
          strapiRoleUuid: true,
        },
      },
    },
  });

  return res;
};
