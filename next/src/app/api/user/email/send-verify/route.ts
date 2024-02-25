import { getDictionary } from '@/dictionaries';
import { getAccessToken, getGraphAPIUser, validateAuth } from '@/libs';
import { verifyGraphAPIEmail } from '@/libs/api/graph/graph-verify-email';
import { getLanguage } from '@/libs/api/utils/get-language';
import { EmailClient, EmailMessage } from '@azure/communication-email';
import jwt from 'jsonwebtoken';

const connectionString =
  process.env.AZURE_BACKEND_COMMUNICATION_SERVICE_CONNECTION_STRING!;

const senderAddress =
  process.env.AZURE_BACKEND_COMMUNICATION_SERVICE_SENDER_EMAIL!;

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export async function POST(req: Request) {
  let lang = getLanguage(req);
  const dictionary = await getDictionary(lang);

  let newEmail: string;
  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const body = await req.json();
    if (!body.email || !emailRegex.test(body.email)) {
      return Response.json(
        { message: dictionary.api.bad_request },
        { status: 400 },
      );
    }
    newEmail = body.email;
  } catch (error) {
    return Response.json(
      { message: dictionary.api.bad_request },
      { status: 400 },
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

  if (user.mail === newEmail) {
    return Response.json(
      { message: dictionary.api.email_already_in_use },
      { status: 400 },
    );
  }

  const isAlreadyInUse = await verifyGraphAPIEmail(accessToken, newEmail);
  if (isAlreadyInUse === null) {
    return Response.json(
      { message: dictionary.api.server_error },
      { status: 503 },
    );
  }

  if (isAlreadyInUse) {
    return Response.json(
      { message: dictionary.api.email_already_in_use },
      { status: 400 },
    );
  }

  const payload = {
    newEmail,
    userId,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '30m',
  });

  const link = `${baseUrl}/${lang}/profile/verify-email?token=${token}`;

  const emailClient = new EmailClient(connectionString);

  const message: EmailMessage = {
    senderAddress,
    content: {
      subject: dictionary.api.email_change_mail_subject,
      html: `
      <html>
        <body>
          <p>${dictionary.api.email_change_mail_text}</p>
          <a href="${link}">${link}</a>
        </body>
      </html>
      `,
    },
    recipients: {
      to: [
        {
          address: newEmail,
        },
      ],
    },
  };

  try {
    const poller = await emailClient.beginSend(message);
    await poller.pollUntilDone();
    return Response.json({ message: dictionary.api.verify_email_sent });
  } catch (error) {
    return Response.json(
      { message: dictionary.api.server_error },
      { status: 503 },
    );
  }
}
