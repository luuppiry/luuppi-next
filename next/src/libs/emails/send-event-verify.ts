import { LuuppiEventReceipt as LuuppiEventReceiptEn } from '@/../emails/event-receipt-en';
import { LuuppiEventReceipt as LuuppiEventReceiptFi } from '@/../emails/event-receipt-fi';
import { getDictionary } from '@/dictionaries';
import { Event, EventRegistration, Payment } from '@prisma/client';
import { render } from '@react-email/components';
import 'server-only';
import { shortDateFormat } from '../constants';
import { firstLetterToUpperCase } from '../utils/first-letter-uppercase';
import { logger } from '../utils/logger';
import { sendEmail } from './nodemailer';

interface SendEventReceiptProps {
  name: string;
  email: string;
  payment: Payment & {
    registration: (EventRegistration & {
      event: Event;
    })[];
  };
}

export const sendEventReceiptEmail = async ({
  name,
  email,
  payment,
}: SendEventReceiptProps): Promise<boolean> => {
  try {
    const dictionary = await getDictionary(
      payment.language === 'EN' ? 'en' : 'fi',
    );

    const emailFi = LuuppiEventReceiptFi({
      name: name,
      orderDate: payment.createdAt,
      orderId: payment.orderId,
      events: payment.registration.map((registration) => ({
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
      orderDate: payment.createdAt,
      orderId: payment.orderId,
      events: payment.registration.map((registration) => ({
        name: registration.event.nameEn,
        date: firstLetterToUpperCase(
          registration.event.startDate.toLocaleString('en', shortDateFormat),
        ),
        location: registration.event.locationEn,
        price: registration.price,
      })),
    });

    const emailHtml = await render(
      payment.language === 'FI' ? emailFi : emailEn,
    );

    await sendEmail({
      to: email,
      subject: dictionary.api.email_registration_confirmation_subject,
      html: emailHtml,
    });

    return true;
  } catch (error) {
    logger.error('Error sending email', error);
    return false;
  }
};
