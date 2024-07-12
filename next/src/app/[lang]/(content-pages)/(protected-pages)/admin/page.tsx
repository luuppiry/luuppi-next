import { auth } from '@/auth';
import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { redirect } from 'next/navigation';

interface AdminProps {
  params: { lang: SupportedLanguage };
}

export default async function Admin({ params }: AdminProps) {
  const session = await auth();

  if (!session?.user?.isLuuppiHato) {
    logger.error('Error getting user');
    redirect(`/${params.lang}`);
  }

  const hasHatoRole = await prisma.rolesOnUsers.findFirst({
    where: {
      entraUserUuid: session.user.entraUserUuid,
      strapiRoleUuid: process.env.NEXT_PUBLIC_LUUPPI_HATO_ID,
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
  });

  // In case of an expired token, force sign out so next sign in will get a new token
  if (!hasHatoRole) {
    logger.error(`User ${session.user.entraUserUuid} had expired hato role`);
    redirect('/api/auth/force-signout');
  }

  // TODO???: Add admin page content here
  return (
    <div>
      <h1>Admin</h1>
    </div>
  );
}
