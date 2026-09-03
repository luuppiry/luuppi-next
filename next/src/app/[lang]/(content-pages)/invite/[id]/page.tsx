import { auth } from '@/auth';
import { ClaimInviteButton } from '@/components/ClaimInviteButton/ClaimInviteButton';
import { LoginButton } from '@/components/LoginButton/LoginButton';
import { getDictionary } from '@/dictionaries';
import { getStrapiData } from '@/libs/strapi/get-strapi-data';
import { APIResponseCollection } from '@/types/types';
import { Metadata } from 'next';
import { connection } from 'next/server';

interface Props {
  params: Promise<{ lang: string; id: string }>;
}

export const instant = false;

export default async function InvitePage({ params }: Props) {
  await connection();
  const { lang, id } = await params;
  const dictionary = await getDictionary(lang);
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="relative flex flex-col gap-4">
        <p className="max-w-xl">{dictionary.pages_invite.must_be_logged_in}</p>

        <LoginButton
          dictionary={dictionary}
          options={{ redirectTo: `/${lang}/invite/${id}` }}
        />

        <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
      </div>
    );
  }

  const strapiUrl = `/api/invites?populate=RoleToGive&populate=Event&filters[Slug][$eq]=${id}`;
  const invites = await getStrapiData<
    APIResponseCollection<'api::invite.invite'>
  >(lang, strapiUrl, [`invite-${id}`], true);

  const invite = invites?.data.at(0);
  const isExpired = invite?.Expires && new Date(invite.Expires) < new Date();

  if (!invite || !invite.RoleToGive?.RoleId || isExpired) {
    return <p>{dictionary.pages_invite.invalid_invite}</p>;
  }

  return (
    <div className="relative">
      <h1 className="mb-4">{dictionary.pages_invite.invite_title}</h1>
      <p className="mb-8">
        {dictionary.pages_invite.role_to_receive}{' '}
        <span className="font-mono">{invite.RoleToGive.RoleId}</span>
      </p>

      <ClaimInviteButton dictionary={dictionary} id={id} lang={lang} />

      <div className="luuppi-pattern absolute -left-48 -top-10 -z-50 h-[701px] w-[801px] max-md:left-0 max-md:h-full max-md:w-full max-md:rounded-none" />
    </div>
  );
}

export const metadata: Metadata = {
  robots: { index: false },
};
