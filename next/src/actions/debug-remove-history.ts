'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { SupportedLanguage } from '@/models/locale';
import { redirect } from 'next/navigation';

export async function debugRemoveHistory(lang: SupportedLanguage) {
  const dictionary = await getDictionary(lang);
  const session = await auth();

  if (!session?.user) {
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  await prisma.eventRegistration.deleteMany({
    where: {
      entraUserUuid: session.user.entraUserUuid!,
    },
  });

  return redirect(`/${lang}/own-events`);
}
