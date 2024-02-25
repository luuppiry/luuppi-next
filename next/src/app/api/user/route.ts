import { getDictionary } from '@/dictionaries';
import { getAccessToken, getGraphAPIUser, validateAuth } from '@/libs';
import { getLanguage } from '@/libs/api/utils/get-language';

export async function GET(req: Request) {
  const lang = getLanguage(req);
  const dictionary = await getDictionary(lang);

  const decodedToken = await validateAuth(req);
  if (!decodedToken) {
    return Response.json(
      { message: dictionary.api.unauthorized },
      { status: 401 },
    );
  }

  const userId = decodedToken.oid;

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return Response.json(
      { message: dictionary.api.server_error },
      { status: 503 },
    );
  }

  const user = await getGraphAPIUser(accessToken, userId);
  if (!user) {
    return Response.json(
      { message: dictionary.api.server_error },
      { status: 503 },
    );
  }

  return Response.json(user);
}
