'server-only';
import prisma from '@/libs/db/prisma';
import { cacheLife, cacheTag } from 'next/cache';

export const getCachedUser = async (entraUserUuid: string) => {
  'use cache';
  cacheLife('minutes');
  cacheTag(`get-cached-user:${entraUserUuid}`);

  const res = await prisma.user.findFirst({
    where: {
      entraUserUuid,
    },
    select: {
      entraUserUuid: true,
      roles: {
        include: {
          role: true,
        },
        where: {
          OR: [
            {
              expiresAt: {
                gte: new Date(),
              },
            },
            {
              expiresAt: null,
            },
          ],
        },
      },
      registrations: {
        where: {
          deletedAt: null,
          OR: [
            {
              paymentCompleted: true,
            },
            {
              reservedUntil: {
                gte: new Date(),
              },
            },
          ],
        },
      },
    },
  });

  return res;
};
