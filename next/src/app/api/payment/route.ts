import prisma from '@/libs/db/prisma';
import { sendEventReceiptEmail } from '@/libs/emails/send-event-verify';
import { checkReturn } from '@/libs/payments/check-return';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { logger } from '@/libs/utils/logger';
import { APIResponse } from '@/types/types';
import { NextRequest, NextResponse } from 'next/server';

const log = logger.child('api:payment');

export async function POST(request: NextRequest) {
  try {
    const result = await checkReturn(request);

    if (!result) {
      return NextResponse.json(
        { message: 'Error processing payment webhook' },
        { status: 200 },
      );
    }

    const { orderId, successful, status } = result;
    log.info('Processing payment webhook', { orderId, successful, status });

    const payment = await prisma.payment.update({
      where: { orderId },
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
      return NextResponse.json({ message: 'OK' }, { status: 200 });
    }

    if (!payment.registration?.[0]?.entraUserUuid) {
      log.error('Error getting entraUserUuid');
      return NextResponse.json(
        { message: 'Error getting entraUserUuid' },
        { status: 400 },
      );
    }

    const entraUserUuid = payment.registration[0].entraUserUuid;

    if (!entraUserUuid) {
      log.error('Error getting entraUserUuid');
      return NextResponse.json(
        { message: 'Error getting entraUserUuid' },
        { status: 400 },
      );
    }

    const localUser = await prisma.user.findFirst({
      where: {
        entraUserUuid,
      },
    });

    if (!localUser) {
      log.error('Error getting user');
      return NextResponse.json(
        { message: 'Error getting user' },
        { status: 400 },
      );
    }

    const eventDocumentId = payment.registration?.[0]?.event?.eventDocumentId;
    const url = `/api/events/${eventDocumentId}?populate=Registration.RoleToGive`;
    const strapiEvents = await getStrapiData<APIResponse<'api::event.event'>>({
      lang: 'fi', // Does not matter here. We only need the role to give.
      url,
      collection: 'event',
      ignoreError: true,
      unique: true,
    });

    const strapiEvent = strapiEvents?.data;

    const roleToGive = strapiEvent?.Registration?.RoleToGive?.RoleId;

    const illegalRoles = [
      process.env.NEXT_PUBLIC_LUUPPI_HATO_ID!,
      process.env.NEXT_PUBLIC_NO_ROLE_ID!,
    ];

    if (roleToGive && !illegalRoles.includes(roleToGive)) {
      log.info(
        `Event ${eventDocumentId} has role to give ${roleToGive}. Giving role to user ${entraUserUuid}`,
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
      log.error('Error getting email');
      return NextResponse.json(
        { message: 'Error getting email' },
        { status: 400 },
      );
    }

    if (!payment.confirmationSentAt && successful) {
      const emailMessageId = await sendEventReceiptEmail({
        name,
        email,
        payment,
      });

      if (!emailMessageId) {
        log.error('Error sending email');
        return NextResponse.json(
          { message: 'Error sending email' },
          { status: 400 },
        );
      }

      await prisma.payment.update({
        where: {
          orderId,
        },
        data: {
          confirmationSentAt: new Date(),
        },
      });

      log.info(`Event confirmation email sent: ${emailMessageId}`);
    }
  } catch (error) {
    log.error('Error processing payment webhook', error);
    return NextResponse.json(
      { message: 'Error processing payment webhook' },
      { status: 400 },
    );
  }

  return NextResponse.json({ message: 'OK' }, { status: 200 });
}
