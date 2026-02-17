'use server';
import { auth } from '@/auth';
import prisma from '@/libs/db/prisma';
import { SupportedLanguage } from '@/models/locale';
import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export async function reservationCancel(
  lang: SupportedLanguage,
  formData: FormData,
) {
  const session = await auth();

  if (!session?.user) return;

  const registrationId = Number(formData.get('registrationId'));
  if (!registrationId || isNaN(registrationId) || registrationId < 1) {
    return;
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
    return;
  }

  await prisma.eventRegistration.update({
    where: {
      id: registrationId,
    },
    data: {
      deletedAt: new Date(),
      answers: {
        deleteMany: {},
      },
    },
  });

  updateTag(`get-cached-user:${session.user.entraUserUuid}`);
  revalidatePath('/[lang]/events/[slug]', 'page');
  redirect(`/${lang}/own-events`);
}
