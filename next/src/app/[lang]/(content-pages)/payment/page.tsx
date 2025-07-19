import { getDictionary } from '@/dictionaries';
import { stripe } from '@/libs/payments';
import { SupportedLanguage } from '@/models/locale';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface PaymentProps {
  params: Promise<{ lang: SupportedLanguage }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Payment({
  params: initialParams,
  searchParams: initialSearchParams,
}: PaymentProps) {
  const params = await initialParams;
  const searchParams = await initialSearchParams;
  const lang = params.lang;
  const dictionary = await getDictionary(params.lang);
  const sessionId = searchParams.session_id as string;
  const canceled = searchParams.canceled === 'true';

  if (!sessionId && !canceled) {
    redirect(`/${lang}`);
  }

  let successful = false;

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      successful = session.payment_status === 'paid';
    } catch (_error) {
      redirect(`/${lang}`);
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center gap-6 text-center max-md:items-start max-md:text-start">
      <h1>
        {successful
          ? dictionary.pages_events.payment_completed
          : dictionary.pages_events.payment_failed}
      </h1>
      {sessionId && (
        <p className="break-all text-sm">
          <strong>ID:</strong> {sessionId}
        </p>
      )}
      <p className="max-w-xl text-lg max-md:text-base">
        {successful
          ? dictionary.pages_events.payment_completed_description
          : dictionary.pages_events.payment_failed_description}
      </p>
      <Link className="btn btn-primary btn-sm text-lg" href={`/${lang}`}>
        {dictionary.pages_404.return_home}
      </Link>
      <div className="luuppi-pattern absolute -left-28 -top-28 -z-50 h-[401px] w-[601px] max-md:left-0 max-md:w-full" />
    </div>
  );
}
