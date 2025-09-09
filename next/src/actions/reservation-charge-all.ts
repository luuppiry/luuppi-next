'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { sendEventReceiptEmail } from '@/libs/emails/send-event-verify';
import { createCharge } from '@/libs/payments/create-charge';
import { logger } from '@/libs/utils/logger';
import { randomUUID } from 'crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

export async function reservationChargeAll(lang: string) {
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

  const priceInCents =
    registrations.reduce((acc, registration) => acc + registration.price, 0) *
    100;

  let redirectUrl: string | null = null;
  try {
    const orderId = randomUUID();

    if (priceInCents) {
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
    } else {
      redirectUrl = `/${lang}/payment/free-event/${orderId}`;
    }

    await prisma.$transaction(async (prisma) => {
      const payment = await prisma.payment.create({
        data: {
          orderId,
          amount: priceInCents,
          status: priceInCents === 0 ? 'COMPLETED' : 'PENDING',
          language: lang === 'en' ? 'EN' : 'FI',
          confirmationSentAt: priceInCents === 0 ? new Date() : null,
          registration: {
            connect: registrations.map((registration) => ({
              id: registration.id,
            })),
          },
        },
        include: {
          registration: {
            include: {
              event: true,
              user: true,
            },
          },
        },
      });

      if (priceInCents === 0) {
        await prisma.eventRegistration.updateMany({
          where: {
            id: {
              in: registrations.map((registration) => registration.id),
            },
          },
          data: {
            paymentCompleted: true,
          },
        });

        const email = payment.registration[0].user.email;
        const user = payment.registration[0].user;
        const name = user.username ?? user.firstName ?? '';

        const success = await sendEventReceiptEmail({
          name,
          email,
          payment,
        });

        if (!success) {
          logger.error('Error sending email, failing silently');
        }
      }
    });

    revalidateTag(`get-cached-user:${session.user.entraUserUuid}`);
    revalidatePath('/[lang]/events/[slug]', 'page');
  } catch (error) {
    logger.error('Error creating charge', error);
    return {
      message: dictionary.api.payment_failed,
      isError: true,
    };
  }

  redirect(redirectUrl);
}
