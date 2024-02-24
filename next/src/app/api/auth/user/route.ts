import { getAccessToken, validateToken } from '@/libs';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
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
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    return new Response('Unauthorized', { status: 401 });
  }

  const user = await response.json();

  return new Response(JSON.stringify(user), {
    headers: {
      'content-type': 'application/json',
    },
  });
}
