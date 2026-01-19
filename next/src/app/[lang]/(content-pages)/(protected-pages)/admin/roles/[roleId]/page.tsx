import { auth } from '@/auth';
import AdminRoleUsers from '@/components/AdminRoleManagement/AdminRoleUsers/AdminRoleUsers';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { SupportedLanguage } from '@/models/locale';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface RolePageProps {
  params: Promise<{ roleId: string; lang: SupportedLanguage }>;
}

export default async function RolePage(props: RolePageProps) {
  const params = await props.params;
  const { roleId, lang } = params;

  const session = await auth();
  const dictionary = await getDictionary(lang);

  if (!session?.user?.isLuuppiHato || !session?.user?.entraUserUuid) {
    redirect(`/${lang}`);
  }

  const hasHatoRole = await prisma.rolesOnUsers.findFirst({
    where: {
      entraUserUuid: session.user.entraUserUuid,
      strapiRoleUuid: process.env.NEXT_PUBLIC_LUUPPI_HATO_ID!,
      OR: [{ expiresAt: { gte: new Date() } }, { expiresAt: null }],
    },
  });

  if (!hasHatoRole) {
    redirect('/api/auth/force-signout');
  }

  const role = await prisma.role.findUnique({
    where: { strapiRoleUuid: roleId },
    include: {
      users: {
        include: {
          user: true,
        },
        where: {
          OR: [{ expiresAt: { gte: new Date() } }, { expiresAt: null }],
        },
      },
    },
  });

  if (!role) {
    redirect(`/${lang}/admin?mode=roles`);
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-6">
        <h2 className="line-clamp-1 break-all text-xl font-semibold">
          {role.strapiRoleUuid}
        </h2>
        <Link
          className="btn btn-ghost btn-sm"
          href={`/${lang}/admin?mode=roles`}
        >
          {dictionary.general.close}
        </Link>
      </div>
      <AdminRoleUsers dictionary={dictionary} lang={lang} role={role} />
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </>
  );
}
