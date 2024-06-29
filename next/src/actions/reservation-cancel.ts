'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { SupportedLanguage } from '@/models/locale';
import { redirect } from 'next/navigation';

export async function reservationCancel(
  lang: SupportedLanguage,
  formData: FormData,
) {
  const dictionary = await getDictionary(lang);
  const session = await auth();

  if (!session?.user) {
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  const registrationId = Number(formData.get('registrationId'));
  if (!registrationId || isNaN(registrationId) || registrationId < 1) {
    return {
      message: dictionary.api.invalid_registration,
      isError: true,
    };
  }

  const registration = await prisma.eventRegistration.findUnique({
    where: {
      id: registrationId,
      entraUserUuid: session.user.entraUserUuid,
      paymentCompleted: false,
      deletedAt: null,
      reservedUntil: {
        gte: new Date(),
      },
    },
  });

  if (!registration) {
    return {
      message: dictionary.api.invalid_registration,
      isError: true,
    };
  }

  await prisma.eventRegistration.update({
    where: {
      id: registrationId,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  redirect(`/${lang}/own-events`);
}
