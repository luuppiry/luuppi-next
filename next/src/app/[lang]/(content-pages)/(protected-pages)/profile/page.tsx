import { auth } from '@/auth';
import ProfileEmailform from '@/components/ProfileEmailForm/ProfileEmailForm';
import ProfileNotificationsForm from '@/components/ProfileNotificationsForm/ProfileNotificationsForm';
import ProfileUserInfoForm from '@/components/ProfileUserInfoForm/ProfileUserInfoForm';
import ProfileUserAddressDeclaration from '@/components/ProfileUserAddressDeclaration/ProfileUserAddressDeclaration';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

interface ProfileProps {
  params: Promise<{ lang: SupportedLanguage }>;
}

export default async function Profile(props: ProfileProps) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);

  const session = await auth();
  if (!session?.user) {
    logger.error('Error getting user');
    redirect(`/${params.lang}`);
  }

  const localUser = await prisma.user.findFirst({
    where: {
      entraUserUuid: session.user.entraUserUuid,
    },
    include: {
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
    },
  });

  const targetYear = getDeclarationYear();
  const declaration = await prisma.addressDeclaration.findUnique({
    where: {
      entraUserUuid_year: {
        entraUserUuid: session.user.entraUserUuid,
        year: targetYear,
      },
    },
  });
  const declared = !!declaration;

  if (!localUser) {
    logger.error('User not found in database. This should not happen.');
    redirect(`/${params.lang}/404`);
  }

  const roles = localUser?.roles.map((role) => role.role.strapiRoleUuid) ?? [];

  const isLuuppiMember = roles.includes(
    process.env.NEXT_PUBLIC_LUUPPI_MEMBER_ID!,
  );

  return (
    <div className="relative">
      <h1 className="mb-12">{dictionary.navigation.profile}</h1>
      <div className="flex w-full flex-col gap-8">
        <ProfileEmailform
          dictionary={dictionary}
          lang={params.lang}
          user={localUser}
        />
        <ProfileUserInfoForm
          dictionary={dictionary}
          isLuuppiMember={isLuuppiMember}
          lang={params.lang}
          user={localUser}
        />
        {Boolean(isLuuppiMember) && (
          <>
            <ProfileUserAddressDeclaration
              declared={declared}
              dictionary={dictionary}
              isLuuppiMember={isLuuppiMember}
              lang={params.lang}
              user={localUser}
            />
          </>
        )}
        <ProfileNotificationsForm
          dictionary={dictionary}
          lang={params.lang}
          user={localUser}
        />
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}

function getDeclarationYear(d = new Date()): number {
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return month >= 9 ? year : year - 1; // Sep–Dec → current, Jan–Aug → previous
}

export async function generateMetadata(props: ProfileProps): Promise<Metadata> {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);
  return {
    title: dictionary.navigation.profile,
  };
}
