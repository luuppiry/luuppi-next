import prisma from '@/libs/db/prisma';
import { sendEventReceiptEmail } from '@/libs/emails/send-event-verify';
import { checkReturn } from '@/libs/payments/check-return';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { logger } from '@/libs/utils/logger';
import { APIResponse } from '@/types/types';
import { NextRequest } from 'next/server';
import url from 'url';

export async function GET(request: NextRequest) {
  const queryParams = url.parse(request.url, true).query;

  try {
    logger.info('Checking return', { queryParams });
    const { orderId, successful } = await checkReturn(queryParams);

    // TODO: Cache this query. Result should not change for the same orderId.
    const payment = await prisma.payment.update({
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

    if (!payment.registration?.[0]?.entraUserUuid) {
      logger.error('Error getting entraUserUuid');
      return new Response('Error getting entraUserUuid', { status: 400 });
    }

    // Always same entraUserUuid for all registrations
    const entraUserUuid = payment.registration[0].entraUserUuid;

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

    const eventId = payment.registration?.[0]?.event?.eventId;
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

    if (!payment.confirmationSentAt && successful) {
      const success = await sendEventReceiptEmail({
        name,
        email,
        payment,
      });

      if (!success) {
        logger.error('Error sending email');
        return new Response('Error sending email', { status: 400 });
      }

      await prisma.payment.update({
        where: {
          orderId,
        },
        data: {
          confirmationSentAt: new Date(),
        },
      });
    }
    logger.info('Event confirmation email sent', { email });
  } catch (error) {
    logger.error('Error checking return', error);
    return new Response('Error checking return', { status: 400 });
  }

  return new Response('OK', { status: 200 });
}
