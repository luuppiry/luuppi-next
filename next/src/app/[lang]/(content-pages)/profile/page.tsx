import { auth } from '@/auth';
import ProfileEmailform from '@/components/ProfileEmailForm/ProfileEmailForm';
import ProfileNotificationsForm from '@/components/ProfileNotificationsForm/ProfileNotificationsForm';
import ProfileUserInfoForm from '@/components/ProfileUserInfoForm/ProfileUserInfoForm';
import { getDictionary } from '@/dictionaries';
import { getAccessToken } from '@/libs/get-access-token';
import { getGraphAPIUser } from '@/libs/graph/graph-get-user';
import { SupportedLanguage } from '@/models/locale';
import { redirect } from 'next/navigation';

interface ProfileProps {
  params: { lang: SupportedLanguage };
}

export default async function Profile({ params }: ProfileProps) {
  const dictionary = await getDictionary(params.lang);
  const session = await auth();
  if (!session?.user) {
    redirect(`/${params.lang}`);
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Error getting access token');
  }

  const user = await getGraphAPIUser(accessToken, session.user.azureId);
  if (!user) {
    throw new Error('Error getting user');
  }

  return (
    <>
      <h1 className="mb-12">{dictionary.navigation.profile}</h1>
      <div className="flex w-full flex-col gap-8">
        <ProfileEmailform
          dictionary={dictionary}
          lang={params.lang}
          user={user}
        />
        <ProfileUserInfoForm
          dictionary={dictionary}
          lang={params.lang}
          user={user}
        />
        <ProfileNotificationsForm
          dictionary={dictionary}
          lang={params.lang}
          user={user}
        />
      </div>
    </>
  );
}
