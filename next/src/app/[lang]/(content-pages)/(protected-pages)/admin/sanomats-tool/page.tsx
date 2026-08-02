import { auth } from '@/auth';
import AdminPdfTool from '@/components/AdminPdfTool/AdminPdfTool';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

interface AdminProps {
  params: Promise<{ lang: SupportedLanguage }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SanomatsPdfTool(props: AdminProps) {
  const params = await props.params;
  const session = await auth();
  const dictionary = await getDictionary(params.lang);

  const user = session?.user;

  if (!user?.entraUserUuid || !user?.isLuuppiHato) {
    logger.error('User not found in session or does not have required role');
    redirect(`/${params.lang}`);
  }

  const hasHatoRole = await prisma.rolesOnUsers.findFirst({
    where: {
      entraUserUuid: user.entraUserUuid,
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
    logger.error(`User ${user.entraUserUuid} had expired hato role`);
    redirect('/api/auth/force-signout');
  }

  return (
    <div className="relative">
      <h1 className="mb-6">{dictionary.pages_admin.sanomats_tool}</h1>
      <p>{dictionary.pages_admin.sanomats_tool_description}</p>
      <AdminPdfTool dictionary={dictionary} />
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}

export async function generateMetadata(props: AdminProps): Promise<Metadata> {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);
  return {
    title: dictionary.navigation.admin,
  };
}
