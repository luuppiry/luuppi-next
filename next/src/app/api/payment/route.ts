import { LuuppiEventReceipt as LuuppiEventReceiptEn } from '@/../emails/event-receipt-en';
import { LuuppiEventReceipt as LuuppiEventReceiptFi } from '@/../emails/event-receipt-fi';
import { getDictionary } from '@/dictionaries';
import { shortDateFormat } from '@/libs/constants';
import prisma from '@/libs/db/prisma';
import { checkReturn } from '@/libs/payments/check-return';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { firstLetterToUpperCase } from '@/libs/utils/first-letter-uppercase';
import { logger } from '@/libs/utils/logger';
import { APIResponse } from '@/types/types';
import { EmailClient, EmailMessage } from '@azure/communication-email';
import { render } from '@react-email/components';
import url from 'url';

const options = {
  senderAddress: process.env.AZURE_COMMUNICATION_SERVICE_SENDER_EMAIL!,
  connectionString: process.env.AZURE_COMMUNICATION_SERVICE_CONNECTION_STRING!,
};

export async function GET(request: Request) {
  const queryParams = url.parse(request.url, true).query;

  try {
    logger.info('Checking return', { queryParams });
    const { orderId, successful } = await checkReturn(queryParams);

    // TODO: Cache this query. Result should not change for the same orderId.
    const payments = await prisma.payment.update({
      where: {
        orderId,
      },
      data: {
        status: successful ? 'COMPLETED' : 'CANCELLED',
        registration: {
          updateMany: successful
            ? {
                where: {},
                data: {
                  paymentCompleted: successful,
                },
              }
            : undefined,
        },
      },
      include: {
        registration: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!successful) {
      return new Response('OK', { status: 200 });
    }

    const dictionary = await getDictionary(
      payments.language === 'EN' ? 'en' : 'fi',
    );

    if (!payments.registration?.[0]?.entraUserUuid) {
      logger.error('Error getting entraUserUuid');
      return new Response('Error getting entraUserUuid', { status: 400 });
    }

    // Always same entraUserUuid for all registrations
    const entraUserUuid = payments.registration[0].entraUserUuid;

    if (!entraUserUuid) {
      logger.error('Error getting entraUserUuid');
      return new Response('Error getting entraUserUuid', { status: 400 });
    }

    const localUser = await prisma.user.findFirst({
      where: {
        entraUserUuid,
      },
    });

    if (!localUser) {
      logger.error('Error getting user');
      return new Response('Error getting user', { status: 400 });
    }

    const eventId = payments.registration?.[0]?.event?.id;
    const strapiUrl = `/api/events/${eventId}?populate=Registration.RoleToGive`;
    const strapiEvent = await getStrapiData<APIResponse<'api::event.event'>>(
      'fi', // Does not matter here. We only need the role to give.
      strapiUrl,
      [`event-${eventId}`],
      true,
    );

    const roleToGive =
      strapiEvent?.data?.attributes?.Registration?.RoleToGive?.data?.attributes
        ?.RoleId;

    const illegalRoles = [
      process.env.NEXT_PUBLIC_LUUPPI_HATO_ID!,
      process.env.NEXT_PUBLIC_NO_ROLE_ID!,
    ];

    if (roleToGive && !illegalRoles.includes(roleToGive)) {
      logger.info(
        `Event ${eventId} has role to give ${roleToGive}. Giving role to user ${entraUserUuid}`,
      );

      await prisma.rolesOnUsers.upsert({
        where: {
          strapiRoleUuid_entraUserUuid: {
            entraUserUuid,
            strapiRoleUuid: roleToGive,
          },
        },
        update: {},
        create: {
          entraUserUuid,
          strapiRoleUuid: roleToGive,
        },
      });
    }

    const name = localUser.username ?? localUser.firstName ?? '';
    const email = localUser.email;

    if (!email) {
      logger.error('Error getting email');
      return new Response('Error getting email', { status: 400 });
    }

    const emailFi = LuuppiEventReceiptFi({
      name: name,
      orderDate: payments.createdAt,
      orderId: payments.orderId,
      events: payments.registration.map((registration) => ({
        name: registration.event.nameFi,
        date: firstLetterToUpperCase(
          registration.event.startDate.toLocaleString('fi', shortDateFormat),
        ),
        location: registration.event.locationFi,
        price: registration.price,
      })),
    });

    const emailEn = LuuppiEventReceiptEn({
      name: name,
      orderDate: payments.createdAt,
      orderId: payments.orderId,
      events: payments.registration.map((registration) => ({
        name: registration.event.nameEn,
        date: firstLetterToUpperCase(
          registration.event.startDate.toLocaleString('en', shortDateFormat),
        ),
        location: registration.event.locationEn,
        price: registration.price,
      })),
    });

    const emailHtml = render(payments.language === 'FI' ? emailFi : emailEn);

    const emailMessage: EmailMessage = {
      senderAddress: options.senderAddress,
      content: {
        subject: dictionary.api.email_registration_confirmation_subject,
        html: emailHtml,
      },
      recipients: {
        to: [
          {
            address: email,
          },
        ],
      },
    };

    const emailClient = new EmailClient(options.connectionString);
    const poller = await emailClient.beginSend(emailMessage);
    await poller.pollUntilDone();
    logger.info('Event confirmation email sent', { email });
  } catch (error) {
    logger.error('Error checking return', error);
    return new Response('Error checking return', { status: 400 });
  }

  return new Response('OK', { status: 200 });
}
