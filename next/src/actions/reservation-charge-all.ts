'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { sendEventReceiptEmail } from '@/libs/emails/send-event-verify';
import { createCharge } from '@/libs/payments/create-charge';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { getStrapiUrl } from '@/libs/strapi/get-strapi-url';
import { logger } from '@/libs/utils/logger';
import { isValidMember } from '@/libs/utils/user';
import { SupportedLanguage } from '@/models/locale';
import { APIResponse } from '@/types/types';
import { randomUUID } from 'crypto';
import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';

type StrapiImage =
  | {
      url?: string;
      formats?: { medium?: { url?: string } };
    }
  | null
  | undefined;

const log = logger.child('action:reservation-charge-all');

export async function reservationChargeAll(lang: SupportedLanguage) {
  const dictionary = await getDictionary(lang);
  const session = await auth();

  if (!session?.user) {
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  const localUser = await prisma.user.findFirst({
    where: { entraUserUuid: session.user.entraUserUuid },
    select: {
      firstName: true,
      lastName: true,
      domicle: true,
    },
  });

  if (!localUser) {
    return { message: dictionary.api.unauthorized, isError: true };
  }

  if (session.user.isLuuppiMember && !isValidMember(localUser)) {
    return {
      message: dictionary.api.incomplete_profile,
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
      const imageByEventId = new Map<string, string | undefined>();
      await Promise.allSettled(
        [...new Set(registrations.map((r) => r.eventDocumentId))].map(
          async (id) => {
            const event = await getStrapiData<APIResponse<'api::event.event'>>({
              lang,
              url: `/api/events/${id}?populate=Image&populate=ImageEn&fields=id`,
              collection: 'event',
              unique: true,
            });

            const image = (
              lang === 'en'
                ? (event.data.ImageEn ?? event.data.Image)
                : event.data.Image
            ) as StrapiImage;

            if (!image) return;

            imageByEventId.set(
              id,
              getStrapiUrl(image.formats?.medium?.url ?? image?.url),
            );
          },
        ),
      );

      redirectUrl = await createCharge(
        {
          amountInCents: priceInCents,
          id: orderId,
          reservations: registrations.map((registration) => ({
            id: registration.id.toString(),
            priceInCents: registration.price * 100,
            name: registration.event[lang === 'fi' ? 'nameFi' : 'nameEn'],
            confirmationTime: registration.createdAt.toISOString(),
            imageUrl: imageByEventId.get(registration.eventDocumentId),
          })),
        },
        lang,
        session.user.email!,
      );
    } else {
      redirectUrl = `/${lang}/own-events`;
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
          log.error('Error sending email, failing silently');
        }
      }
    });

    updateTag(`get-cached-user:${session.user.entraUserUuid}`);
    for (const reg of registrations) {
      updateTag(`get-cached-event-participants:${reg.eventDocumentId}`);
      updateTag(`get-cached-event-registrations:${reg.eventDocumentId}`);
    }
  } catch (error) {
    log.error('Error creating charge', error);
    return {
      message: dictionary.api.payment_failed,
      isError: true,
    };
  }

  redirect(redirectUrl);
}
