'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import { getAccessToken } from '@/libs/get-access-token';
import { verifyGraphAPIEmail } from '@/libs/graph/graph-verify-email';
import { isRateLimited, updateRateLimitCounter } from '@/libs/rate-limiter';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { EmailClient, EmailMessage } from '@azure/communication-email';
import jwt, { JwtPayload } from 'jsonwebtoken';

const connectionString =
  process.env.AZURE_COMMUNICATION_SERVICE_CONNECTION_STRING!;

const senderAddress = process.env.AZURE_COMMUNICATION_SERVICE_SENDER_EMAIL!;

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

const jwtSecret = process.env.JWT_SECRET!;

const cacheKey = 'email-verification';

export async function sendVerifyEmail(
  lang: SupportedLanguage,
  _: any,
  formData: FormData,
) {
  const dictionary = await getDictionary(lang);

  const session = await auth();
  const user = session?.user;

  if (!user) {
    logger.error('User not found in session');
    return {
      message: dictionary.api.unauthorized,
      isError: true,
    };
  }

  const isLimited = await isRateLimited(user.azureId, cacheKey, 3);
  if (isLimited) {
    logger.error(`User is being rate limited: ${user.email}`);
    return {
      message: dictionary.api.ratelimit,
      isError: true,
    };
  }

  const email = formData.get('email') as string;

  if (!email) {
    logger.error('Email missing in form data');
    return {
      message: dictionary.api.invalid_email,
      isError: true,
      field: 'email',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    logger.error('Email does not match regex');
    return {
      message: dictionary.api.invalid_email,
      isError: true,
      field: 'email',
    };
  }

  if (user.email === email) {
    logger.error(
      // eslint-disable-next-line quotes
      "User's email is the same as the new email when trying to change",
      email,
    );
    return {
      message: dictionary.api.email_already_in_use,
      isError: true,
      field: 'email',
    };
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    logger.error('Error getting access token for Graph API');
    return {
      message: dictionary.api.server_error,
      isError: true,
    };
  }
  const result = await verifyGraphAPIEmail(accessToken, email);

  if (result === null) {
    logger.error('Error verifying email with Graph API, server error');
    return {
      message: dictionary.api.server_error,
      isError: true,
    };
  }

  if (result) {
    logger.error('Email already in use by another user');
    return {
      message: dictionary.api.email_already_in_use,
      isError: true,
      field: 'email',
    };
  }

  const payload = {
    newMail: email,
    userId: user.azureId,
  } as JwtPayload & { newMail: string; userId: string };

  const token = jwt.sign(payload, jwtSecret, {
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
          address: email,
        },
      ],
    },
  };

  try {
    const poller = await emailClient.beginSend(message);
    await poller.pollUntilDone();
    await updateRateLimitCounter(user.azureId, cacheKey);
    logger.info('Email change verification email sent to', email);
    return {
      message: dictionary.api.verify_email_sent,
      isError: false,
    };
  } catch (error) {
    logger.error('Error sending verification email', error);
    return {
      message: dictionary.api.email_sending_failed,
      isError: true,
    };
  }
}
