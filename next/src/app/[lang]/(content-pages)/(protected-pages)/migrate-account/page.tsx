import { auth } from '@/auth';
import LegacyAccountMigrate from '@/components/LegacyAccountMigrate/LegacyAccountMigrate';
import { getDictionary } from '@/dictionaries';
import { logger } from '@/libs/utils/logger';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { lang as language } from 'next/root-params';

export default async function MigrateAccount() {
  const lang = await language();
  const dictionary = await getDictionary();
  const session = await auth();

  if (!session?.user) {
    logger.error('Error getting user');
    redirect(`/${lang}`);
  }

  if (session.user.isLuuppiMember) {
    logger.info('User is already a Luuppi member');
    redirect(`/${lang}/profile`);
  }

  return (
    <div className="relative">
      <h1 className="mb-12">{dictionary.navigation.migrate_account}</h1>
      <div className="flex w-full flex-col gap-8">
        <LegacyAccountMigrate dictionary={dictionary} lang={lang} />
      </div>
      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const dictionary = await getDictionary();
  return {
    title: dictionary.navigation.migrate_account,
  };
}
