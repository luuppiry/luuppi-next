import { getDictionary } from '@/dictionaries';
import { getAccessToken, updateGraphAPIUser, validateAuth } from '@/libs';
import { getLanguage } from '@/libs/api/utils/get-language';
import jwt, { JwtPayload } from 'jsonwebtoken';

const tenantName = process.env.NEXT_PUBLIC_AZURE_TENANT_NAME!;

export async function POST(req: Request) {
  let lang = getLanguage(req);
  const dictionary = await getDictionary(lang);

  let emailTokenUnverified: string;
  try {
    const body = await req.json();
    if (!body.token) {
      return Response.json(
        { message: dictionary.api.bad_request },
        { status: 400 },
      );
    }

    emailTokenUnverified = body.token;
  } catch (error) {
    return Response.json(
      { message: dictionary.api.bad_request },
      { status: 400 },
    );
  }

  let emailTokenVerified: {
    newEmail: string;
    userId: string;
  } & JwtPayload;
  try {
    const decodedEmailToken = jwt.verify(
      emailTokenUnverified,
      process.env.JWT_SECRET!,
    ) as JwtPayload & { newEmail?: string; userId?: string };
    if (!decodedEmailToken.newEmail || !decodedEmailToken.userId) {
      return Response.json(
        { message: dictionary.api.bad_request },
        { status: 400 },
      );
    }
    emailTokenVerified = decodedEmailToken as {
      newEmail: string;
      userId: string;
    } & JwtPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return Response.json(
        { message: dictionary.api.email_token_expired_or_invalid },
        { status: 401 },
      );
    }
    return Response.json(
      { message: dictionary.api.server_error },
      { status: 503 },
    );
  }

  const decodedToken = await validateAuth(req);
  if (!decodedToken) {
    return Response.json(
      { message: dictionary.api.unauthorized },
      { status: 401 },
    );
  }

  const userId = decodedToken.oid;

  if (emailTokenVerified.userId !== userId) {
    return Response.json(
      { message: dictionary.api.unauthorized },
      { status: 401 },
    );
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return Response.json(
      { message: dictionary.api.server_error },
      { status: 503 },
    );
  }

  const { newEmail } = emailTokenVerified;

  const emailUpdated = await updateGraphAPIUser(accessToken, userId, {
    identities: [
      {
        signInType: 'emailAddress',
        issuer: `${tenantName}.onmicrosoft.com`,
        issuerAssignedId: newEmail,
      },
    ],
  });

  if (!emailUpdated) {
    return Response.json(
      { message: dictionary.api.server_error },
      { status: 503 },
    );
  }

  return Response.json({ message: dictionary.api.email_changed });
}
