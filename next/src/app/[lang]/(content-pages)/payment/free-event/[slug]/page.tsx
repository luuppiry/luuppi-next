import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { SupportedLanguage } from '@/models/locale';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface FreeEventProps {
  params: { slug: string; lang: SupportedLanguage };
}

export default async function Event({ params }: FreeEventProps) {
  const dictionary = await getDictionary(params.lang);

  const uuid = params.slug;

  if (!uuid || typeof uuid !== 'string' || uuid.length !== 36) {
    redirect(`/${params.lang}/404`);
  }

  const order = await prisma.payment.findUnique({
    where: {
      orderId: uuid,
    },
  });

  return (
    <div className="relative flex flex-col items-center justify-center gap-6 text-center max-md:items-start max-md:text-start">
      <h1>
        {order
          ? dictionary.pages_events.payment_completed
          : dictionary.pages_events.payment_failed}
      </h1>
      <p className="text-sm">
        <strong>ID:</strong> {order?.orderId ?? uuid}
      </p>
      <p className="max-w-xl text-lg max-md:text-base">
        {order
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
