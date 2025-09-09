'use server';
import { auth } from '@/auth';
import { getDictionary } from '@/dictionaries';
import { sendVerificationEmail } from '@/libs/emails/send-verification-email';
import { getAccessToken } from '@/libs/get-access-token';
import { verifyGraphAPIEmail } from '@/libs/graph/graph-verify-email';
import { isRateLimited, updateRateLimitCounter } from '@/libs/rate-limiter';
import { logger } from '@/libs/utils/logger';
import jwt, { JwtPayload } from 'jsonwebtoken';

const CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  CACHE_KEY: 'email-verification',
  RATE_LIMIT: 3,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  JWT_EXPIRES_IN: '30m',
} as const;

type EmailVerifyResult = {
  message: string;
  isError: boolean;
  field?: string;
};

export async function emailSendVerify(
  lang: string,
  formData: FormData,
): Promise<EmailVerifyResult> {
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

  const isLimited = await isRateLimited(
    user.entraUserUuid,
    CONFIG.CACHE_KEY,
    CONFIG.RATE_LIMIT,
  );
  if (isLimited) {
    logger.error(`User is being rate limited: ${user.email}`);
    return {
      message: dictionary.api.ratelimit,
      isError: true,
    };
  }

  await updateRateLimitCounter(user.entraUserUuid, CONFIG.CACHE_KEY);

  const email = formData.get('email') as string;

  if (!email) {
    logger.error('Email missing in form data');
    return {
      message: dictionary.api.invalid_email,
      isError: true,
      field: 'email',
    };
  }

  if (!CONFIG.EMAIL_REGEX.test(email)) {
    logger.error('Email does not match regex');
    return {
      message: dictionary.api.invalid_email,
      isError: true,
      field: 'email',
    };
  }

  if (user.email === email) {
    logger.error(
      'User email is the same as the new email when trying to change',
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
    userId: user.entraUserUuid,
  } as JwtPayload & { newMail: string; userId: string };

  const token = jwt.sign(payload, CONFIG.JWT_SECRET, {
    expiresIn: CONFIG.JWT_EXPIRES_IN,
  });

  const link = `${CONFIG.BASE_URL}/${lang}/profile/verify-email?token=${token}`;

  const success = await sendVerificationEmail({
    to: email,
    name: user.name || user.email!,
    verificationLink: link,
    subject: dictionary.api.email_change_mail_subject,
    language: lang,
  });

  if (success) {
    return {
      message: dictionary.api.verify_email_sent,
      isError: false,
    };
  }

  return {
    message: dictionary.api.email_sending_failed,
    isError: true,
  };
}
