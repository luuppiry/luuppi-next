import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { checkReturn } from '@/libs/payments/check-return';
import { SupportedLanguage } from '@/models/locale';
import Link from 'next/link';

interface PaymentProps {
  params: { lang: SupportedLanguage };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Payment({ params, searchParams }: PaymentProps) {
  const dictionary = await getDictionary(params.lang);

  const { orderId, successful } = await checkReturn(searchParams);

  // TODO: Cache this query. Result should not change for the same orderId.
  await prisma.payment.update({
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
  });

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
