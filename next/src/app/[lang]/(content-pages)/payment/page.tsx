import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { sendEventReceiptEmail } from '@/libs/emails/send-event-verify';
import { checkReturn } from '@/libs/payments/check-return';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import Link from 'next/link';

interface PaymentProps {
  params: Promise<{ lang: SupportedLanguage }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Payment(props: PaymentProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);

  const { orderId, successful } = await checkReturn(searchParams);

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
          user: true,
        },
      },
    },
  });

  if (payment && successful && !payment.confirmationSentAt) {
    const email = payment.registration[0].user.email;
    const user = payment.registration[0].user;
    const name = user.username ?? user.firstName ?? '';

    const success = await sendEventReceiptEmail({
      name,
      email,
      payment,
    });

    if (!success) {
      logger.error('Error sending email');
      throw new Error('Error sending email');
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

  return (
    <div className="relative flex flex-col items-center justify-center gap-6 text-center max-md:items-start max-md:text-start">
      <h1>
        {successful
          ? dictionary.pages_events.payment_completed
          : dictionary.pages_events.payment_failed}
      </h1>
      <p className="text-sm">
        <strong>ID:</strong> {orderId}
      </p>
      <p className="max-w-xl text-lg max-md:text-base">
        {successful
          ? dictionary.pages_events.payment_completed_description
          : dictionary.pages_events.payment_failed_description}
      </p>
      <Link className="btn btn-primary btn-sm text-lg" href={`/${params.lang}`}>
        {dictionary.pages_404.return_home}
      </Link>
      <div className="luuppi-pattern absolute -left-28 -top-28 -z-50 h-[401px] w-[601px] max-md:left-0 max-md:w-full" />
    </div>
  );
}
