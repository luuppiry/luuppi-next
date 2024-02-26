import { getDictionary } from '@/dictionaries';
import { SupportedLanguage } from '@/models/locale';
import { redirect } from 'next/navigation';

interface VerifyEmailProps {
  params: { lang: SupportedLanguage };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function VerifyEmail({
  params,
  searchParams,
}: VerifyEmailProps) {
  const dictionary = await getDictionary(params.lang);

  const token = searchParams.token as string;

  if (!token || token.length === 0) {
    redirect(`/${params.lang}/404`);
  }

  return (
    <>
      <h1>{dictionary.pages_verify_email.title}</h1>
    </>
  );
}
