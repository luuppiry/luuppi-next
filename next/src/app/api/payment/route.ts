import { LuuppiEventReceipt as LuuppiEventReceiptEn } from '@/../emails/event-receipt-en';
import { LuuppiEventReceipt as LuuppiEventReceiptFi } from '@/../emails/event-receipt-fi';
import { getDictionary } from '@/dictionaries';
import { shortDateFormat } from '@/libs/constants';
import prisma from '@/libs/db/prisma';
import { getAccessToken } from '@/libs/get-access-token';
import { getGraphAPIUser } from '@/libs/graph/graph-get-user';
import { checkReturn } from '@/libs/payments/check-return';
import { logger } from '@/libs/utils/logger';
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

    const accessToken = await getAccessToken();
    if (!accessToken) {
      logger.error('Error getting access token for Graph API');
      return new Response('Error getting access token for Graph API', {
        status: 400,
      });
    }
    const user = await getGraphAPIUser(
      accessToken,
      payments.registration[0].entraUserUuid,
    );

    if (!user) {
      logger.error('Error getting user');
      return new Response('Error getting user', { status: 400 });
    }

    const name =
      user?.displayName ??
      user?.preferredName ??
      user?.givenName ??
      user?.surname ??
      '';
    const email = user?.mail;

    if (!email) {
      logger.error('Error getting email');
      return new Response('Error getting email', { status: 400 });
    }

    const emailFi = LuuppiEventReceiptFi({
      name: name,
      events: payments.registration.map((registration) => ({
        name: registration.event.nameFi,
        date: registration.event.startDate.toLocaleString(
          'fi',
          shortDateFormat,
        ),
        location: registration.event.locationFi,
        price: registration.price,
      })),
    });

    const emailEn = LuuppiEventReceiptEn({
      name: name,
      events: payments.registration.map((registration) => ({
        name: registration.event.nameEn,
        date: registration.event.startDate.toLocaleString(
          'en',
          shortDateFormat,
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
    return new Response('Error checking return', { status: 400 });
  }

  return new Response('OK', { status: 200 });
}
