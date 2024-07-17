'server-only';
import prisma from '@/libs/db/prisma';
import { cache } from 'react';

export const getEventRegistrations = cache(async (eventId: number) => {
  const registrations = await prisma.eventRegistration.findMany({
    where: {
      eventId,
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
      ],
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
      createdAt: 'desc',
    },
    distinct: ['entraUserUuid'],
  });

  return registrations;
});
