'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { createCharge } from '@/libs/payments/create-charge';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { randomUUID } from 'crypto';
import { redirect } from 'next/navigation';

export async function reservationChargeAll(lang: SupportedLanguage) {
  const dictionary = await getDictionary(lang);
  const session = await auth();

  if (!session?.user) {
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  const registrations = await prisma.eventRegistration.findMany({
    where: {
      entraUserUuid: session.user.entraUserUuid,
      paymentCompleted: false,
      deletedAt: null,
      reservedUntil: {
        gte: new Date(),
      },
    },
    include: {
      event: true,
      payments: true,
    },
  });

  if (!registrations.length) {
    return {
      message: dictionary.api.invalid_registration,
      isError: true,
    };
  }

  const hasPendingRegistration = registrations.some((registration) =>
    registration.payments.some((payment) => payment.status === 'PENDING'),
  );

  if (hasPendingRegistration) {
    return {
      message: dictionary.api.pending_payment,
      isError: true,
    };
  }

  const priceInCents =
    registrations.reduce((acc, registration) => acc + registration.price, 0) *
    100;

  let redirectUrl: string | null = null;
  try {
    const orderId = randomUUID();

    redirectUrl = await createCharge(
      {
        amountInCents: priceInCents,
        id: orderId,
        reservations: registrations.map((registration) => ({
          id: registration.id.toString(),
          priceInCents: registration.price * 100,
          name: registration.event[lang === 'fi' ? 'nameFi' : 'nameEn'],
          confirmationTime: registration.createdAt.toISOString(),
        })),
      },
      lang,
      session.user.email!,
    );

    await prisma.payment.create({
      data: {
        orderId,
        amount: priceInCents,
        language: lang === 'en' ? 'EN' : 'FI',
        registration: {
          connect: registrations.map((registration) => ({
            id: registration.id,
          })),
        },
      },
    });
  } catch (error) {
    logger.error('Error creating charge', error);
    return {
      message: dictionary.api.payment_failed,
      isError: true,
    };
  }

  redirect(redirectUrl);
}
