import { signOut } from '@/actions/auth';
import { auth } from '@/auth';
import SubmitButton from '@/components/SubmitButton/SubmitButton';
import { getDictionary } from '@/dictionaries';
import prisma from '@/libs/db/prisma';
import { getAccessToken } from '@/libs/get-access-token';
import { updateGraphAPIUser } from '@/libs/graph/graph-update-user';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const tenantName = process.env.AZURE_TENANT_NAME!;

interface VerifyEmailProps {
  params: { lang: SupportedLanguage };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function VerifyEmail({
  params,
  searchParams,
}: VerifyEmailProps) {
  const dictionary = await getDictionary(params.lang);

  const emailChangeToken = searchParams.token as string;

  if (!emailChangeToken) {
    redirect(`/${params.lang}/404`);
  }

  const session = await auth();

  if (!session?.user) {
    redirect(`/${params.lang}`);
  }

  let newEmailVerified: string;
  let userIdVerified: string;
  try {
    const decoded = jwt.verify(
      emailChangeToken,
      process.env.JWT_SECRET as string,
    ) as JwtPayload & { newMail: string; userId: string };

    const { newMail, userId } = decoded;

    if (!newMail || !userId) {
      logger.error('Invalid token, missing newMail or userId');
      redirect(`/${params.lang}/404`);
    }

    newEmailVerified = newMail;
    userIdVerified = userId;
  } catch (error) {
    logger.error('Error verifying token', error);
    redirect(`/${params.lang}/404`);
  }

  if (session.user.entraUserUuid !== userIdVerified) {
    logger.error('User ID does not match token');
    redirect(`/${params.lang}/404`);
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    logger.error('Error getting access token for Graph API');
    redirect(`/${params.lang}/404`);
  }

  const graphEmailUpdated = await updateGraphAPIUser(
    accessToken,
    session.user.entraUserUuid,
    {
      identities: [
        {
          signInType: 'emailAddress',
          issuer: `${tenantName}.onmicrosoft.com`,
          issuerAssignedId: newEmailVerified,
        },
      ],
      mail: newEmailVerified,
    },
  );

  if (!graphEmailUpdated) {
    logger.error('Error updating user email');
    redirect(`/${params.lang}/404`);
  }

  await prisma.user.update({
    where: {
      entraUserUuid: session.user.entraUserUuid,
    },
    data: {
      email: newEmailVerified,
    },
  });

  revalidatePath(`/${params.lang}/profile`);

  return (
    <div className="relative flex flex-col items-center justify-center gap-6 text-center max-md:items-start max-md:text-start">
      <h1>{dictionary.pages_verify_email.email_changed}</h1>
      <p className="text-sm">
        <strong>{dictionary.pages_verify_email.new_email}:</strong>{' '}
        {newEmailVerified}
      </p>
      <p className="max-w-xl text-lg max-md:text-base">
        {dictionary.pages_verify_email.email_changed_description}
      </p>
      <form action={signOut}>
        <SubmitButton text={dictionary.general.logout} />
      </form>
      <div className="luuppi-pattern absolute -left-28 -top-28 -z-50 h-[401px] w-[601px] max-md:left-0 max-md:w-full" />
    </div>
  );
}
