import { auth } from '@/auth';
import AdminEventManagement from '@/components/AdminEventManagement/AdminEventManagement';
import AdminUserManagement from '@/components/AdminUserManagement/AdminUserManagement';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface AdminProps {
  params: { lang: SupportedLanguage };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Admin({ params, searchParams }: AdminProps) {
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

  // TODO: These could be fetched using server action on the client
  // on demand, but for now we'll just fetch them here
  const availableRoles = await prisma.role.findMany({
    select: {
      strapiRoleUuid: true,
    },
  });

  // Hato role cannot be given or removed via UI. No role also filtered out
  // because it's not relevant in any way.
  const SUPER_ADMINS = process.env.XXX_SUPER_ADMIN_XXX!.split(',');

  const availableRolesFiltered = availableRoles
    .filter(
      (role) =>
        SUPER_ADMINS.includes(user.entraUserUuid) ||
        (role.strapiRoleUuid !== process.env.NEXT_PUBLIC_LUUPPI_HATO_ID &&
          role.strapiRoleUuid !== process.env.NEXT_PUBLIC_NO_ROLE_ID),
    )
    .map((role) => role.strapiRoleUuid);

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
        <AdminUserManagement
          dictionary={dictionary}
          lang={params.lang}
          roles={availableRolesFiltered}
        />
      )}
      {mode === 'event' && (
        <AdminEventManagement dictionary={dictionary} lang={params.lang} />
      )}
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}

export async function generateMetadata({
  params,
}: AdminProps): Promise<Metadata> {
  const dictionary = await getDictionary(params.lang);
  return {
    title: dictionary.navigation.admin,
  };
}
