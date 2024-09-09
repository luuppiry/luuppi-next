'server-only';
import prisma from '@/libs/db/prisma';
import { unstable_cache } from 'next/cache';

export const getCachedEventRegistrations = (eventId: number) =>
  unstable_cache(
    async (eventId: number) => {
      const res = await prisma.eventRegistration.findMany({
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
    },
    ['get-cached-event-registrations'],
    {
      revalidate: 60,
      tags: [`get-cached-event-registrations:${eventId}`],
    },
  )(eventId);
