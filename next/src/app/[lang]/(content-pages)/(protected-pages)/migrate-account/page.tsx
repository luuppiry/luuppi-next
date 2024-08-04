import { auth } from '@/auth';
import LegacyAccountMigrate from '@/components/LegacyAccountMigrate/LegacyAccountMigrate';
import { getDictionary } from '@/dictionaries';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

interface MigrateAccountProps {
  params: { lang: SupportedLanguage };
}

export default async function MigrateAccount({ params }: MigrateAccountProps) {
  const dictionary = await getDictionary(params.lang);

  const session = await auth();
  if (!session?.user) {
    logger.error('Error getting user');
    redirect(`/${params.lang}`);
  }

  if (session.user.isLuuppiMember) {
    logger.info('User is already a Luuppi member');
    redirect(`/${params.lang}/profile`);
  }

  return (
    <div className="relative">
      <h1 className="mb-12">{dictionary.navigation.migrate_account}</h1>
      <div className="flex w-full flex-col gap-8">
        <LegacyAccountMigrate dictionary={dictionary} lang={params.lang} />
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}

export async function generateMetadata({
  params,
}: MigrateAccountProps): Promise<Metadata> {
  const dictionary = await getDictionary(params.lang);
  return {
    title: dictionary.navigation.migrate_account,
  };
}
