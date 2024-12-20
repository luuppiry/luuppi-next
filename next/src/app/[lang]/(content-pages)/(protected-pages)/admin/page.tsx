import { auth } from '@/auth';
import AdminEventManagement from '@/components/AdminEventManagement/AdminEventManagement';
import AdminUsersTable from '@/components/AdminUserManagement/AdminUsersTable/AdminUsersTable';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface AdminProps {
  params: Promise<{ lang: SupportedLanguage }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Admin(props: AdminProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const session = await auth();
  const dictionary = await getDictionary(params.lang);
  const mode = searchParams.mode;

  const user = session?.user;

  if (!user?.entraUserUuid || !user?.isLuuppiHato) {
    logger.error('User not found in session or does not have required role');
    redirect(`/${params.lang}`);
  }

  const allowedModes = ['user', 'event'];
  if (!mode || typeof mode !== 'string' || !allowedModes.includes(mode)) {
    redirect(`/${params.lang}/admin?mode=user`);
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
      <h1 className="mb-12">{dictionary.navigation.admin}</h1>
      <div className="mb-8 flex w-full items-center justify-between rounded-lg bg-background-50 p-4 max-md:flex-col max-md:justify-center max-md:gap-4 max-md:px-2">
        <div
          className="tabs-boxed tabs border bg-white max-md:w-full"
          role="tablist"
        >
          <Link
            className={`tab text-nowrap font-semibold ${mode === 'user' && 'tab-active'}`}
            href={`/${params.lang}/admin?mode=user`}
            role="tab"
          >
            {dictionary.pages_admin.user_management}
          </Link>
          <Link
            className={`tab text-nowrap font-semibold ${mode === 'event' && 'tab-active'}`}
            href={`/${params.lang}/admin?mode=event`}
            role="tab"
          >
            {dictionary.pages_admin.event_management}
          </Link>
        </div>
      </div>
      {mode === 'user' && (
        <AdminUsersTable dictionary={dictionary} lang={params.lang} />
      )}
      {mode === 'event' && (
        <AdminEventManagement dictionary={dictionary} lang={params.lang} />
      )}
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
