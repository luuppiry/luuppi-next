import { getAccessToken, validateToken } from '@/libs';
import jwt from 'jsonwebtoken';

export async function PATCH(req: Request) {
  const { email } = await req.json();
  if (!email) {
    return new Response('Bad Request', { status: 400 });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
  }

  const authToken = authHeader.split(' ')?.[1];
  if (!authToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  const isValidAuth = await validateToken(authToken);
  if (!isValidAuth) {
    return new Response('Unauthorized', { status: 401 });
  }

  let decoded: { [key: string]: any } | null;
  try {
    decoded = jwt.decode(authToken, { json: true });
  } catch (error) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!decoded) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = decoded.oid;

  const accessToken = await getAccessToken();

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${userId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identities: [
          {
            signInType: 'emailAddress',
            issuer: 'luuppiweba.onmicrosoft.com',
            issuerAssignedId: email,
          },
        ],
        mail: email,
      }),
    },
  );

  if (!response.ok) {
    return new Response('EmailChangeFailed', { status: 500 });
  }

  return new Response('OK', { status: 200 });
}
