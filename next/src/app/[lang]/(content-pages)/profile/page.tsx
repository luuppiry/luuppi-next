import { auth } from '@/auth';
import ProfileEmailform from '@/components/ProfileEmailForm/ProfileEmailForm';
import ProfileNotificationsForm from '@/components/ProfileNotificationsForm/ProfileNotificationsForm';
import ProfileUserInfoForm from '@/components/ProfileUserInfoForm/ProfileUserInfoForm';
import { getDictionary } from '@/dictionaries';
import { getAccessToken } from '@/libs/get-access-token';
import { getGraphAPIUser } from '@/libs/graph/graph-get-user';
import { getGraphAPIUserGroups } from '@/libs/graph/graph-get-user-groups';
import { formatMetadata } from '@/libs/strapi/format-metadata';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

const luuppiMemberGroupId = process.env.AZURE_LUUPPI_MEMBER_GROUP;

interface ProfileProps {
  params: { lang: SupportedLanguage };
}

export default async function Profile({ params }: ProfileProps) {
  const dictionary = await getDictionary(params.lang);

  const session = await auth();
  if (!session?.user) {
    logger.error('Error getting user');
    redirect(`/${params.lang}`);
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    logger.error('Error getting access token for Graph API');
    redirect(`/${params.lang}`);
  }

  const user = await getGraphAPIUser(accessToken, session.user.azureId);
  const groups = await getGraphAPIUserGroups(accessToken, session.user.azureId);
  if (!user || !groups) {
    logger.error('Error getting user or groups from Graph API');
    redirect(`/${params.lang}`);
  }

  return (
    <div className="relative">
      <h1 className="mb-12">{dictionary.navigation.profile}</h1>
      <div className="flex w-full flex-col gap-8">
        <ProfileEmailform
          dictionary={dictionary}
          lang={params.lang}
          user={user}
        />
        <ProfileUserInfoForm
          dictionary={dictionary}
          isLuuppiMember={groups.value.some(
            (group) => group.id === luuppiMemberGroupId,
          )}
          lang={params.lang}
          user={user}
        />
        <ProfileNotificationsForm
          dictionary={dictionary}
          lang={params.lang}
          user={user}
        />
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}

export async function generateMetadata({
  params,
}: ProfileProps): Promise<Metadata> {
  const url =
    '/api/profile?populate=Seo.twitter.twitterImage&populate=Seo.openGraph.openGraphImage';
  const tags = ['profile'];

  const data = await getStrapiData<APIResponse<'api::profile.profile'>>(
    params.lang,
    url,
    tags,
  );

  const pathname = `/${params.lang}/profile`;

  return formatMetadata(data, pathname);
}
