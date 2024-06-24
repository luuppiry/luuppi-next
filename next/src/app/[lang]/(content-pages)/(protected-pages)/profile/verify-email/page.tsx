import { auth } from '@/auth';
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
  // const dictionary = await getDictionary(params.lang);

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

  const emailUpdated = await updateGraphAPIUser(
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

  if (!emailUpdated) {
    logger.error('Error updating user email');
    redirect(`/${params.lang}/404`);
  }

  revalidatePath(`/${params.lang}/profile`);

  // TODO: Proper UI
  return (
    <>
      <h1>Email changed to {newEmailVerified}</h1>
    </>
  );
}
