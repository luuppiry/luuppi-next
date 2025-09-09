import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface FreeEventProps {
  params: Promise<{ slug: string; lang: string }>;
}

export default async function Event(props: FreeEventProps) {
  const params = await props.params;
  const dictionary = await getDictionary(params.lang);

  const uuid = params.slug;

  if (!uuid || typeof uuid !== 'string' || uuid.length !== 36) {
    redirect(`/${params.lang}/404`);
  }

  const payment = await prisma.payment.findUnique({
    where: {
      orderId: uuid,
    },
  });

  return (
    <div className="relative flex flex-col items-center justify-center gap-6 text-center max-md:items-start max-md:text-start">
      <h1>
        {payment
          ? dictionary.pages_events.payment_completed
          : dictionary.pages_events.payment_failed}
      </h1>
      <p className="text-sm">
        <strong>ID:</strong> {payment?.orderId ?? uuid}
      </p>
      <p className="max-w-xl text-lg max-md:text-base">
        {payment
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
