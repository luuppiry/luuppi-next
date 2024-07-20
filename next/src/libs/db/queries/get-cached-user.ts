'server-only';
import prisma from '@/libs/db/prisma';
import { unstable_cache } from 'next/cache';

export const getCachedUser = unstable_cache(
  async (entraUserUuid: string) => {
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
        registrations: true,
      },
    });

    return res;
  },
  ['get-cached-user'],
  {
    revalidate: 30,
  },
);
