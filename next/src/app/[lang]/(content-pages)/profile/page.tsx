import ProfileForm from '@/components/ProfileForm/ProfileForm';
import { SupportedLanguage } from '@/models/locale';

interface ProfileProps {
  params: { lang: SupportedLanguage };
}

export default async function Profile({ params }: ProfileProps) {
  return (
    <>
      <h1>Profile</h1>
      <ProfileForm lang={params.lang} />
    </>
  );
}
