'use server';
import { getDictionary } from '@/dictionaries';
import { luuppiEmails } from '@/libs/constants/emails';
import { sendFeedbackEmail } from '@/libs/emails/send-feedback-email';
import { isRateLimited, updateRateLimitCounter } from '@/libs/rate-limiter';
import { logger } from '@/libs/utils/logger';
import { Dictionary } from '@/models/locale';

const CONFIG = {
  TURNSTILE_VERIFY_ENDPOINT:
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  TURNSTILE_SECRET: process.env.TURNSTILE_SECRET!,
  CACHE_KEY: 'feedback',
  RATE_LIMIT: 10,
} as const;

type FormValidationResult = {
  message: string;
  isError: boolean;
  field?: string;
};

type FormFields = {
  turnstileToken?: string;
  name?: string;
  email?: string;
  receiver?: string;
  subject?: string;
  message?: string;
};

export async function emailSendFeedback(
  lang: string,
  formData: FormData,
): Promise<FormValidationResult> {
  const dictionary = await getDictionary(lang);

  const isLimited = await isRateLimited(
    CONFIG.CACHE_KEY,
    CONFIG.CACHE_KEY,
    CONFIG.RATE_LIMIT,
  );
  if (isLimited) {
    logger.error('Feedback is being rate limited');
    return {
      message: dictionary.api.ratelimit,
      isError: true,
    };
  }

  await updateRateLimitCounter(CONFIG.CACHE_KEY, CONFIG.CACHE_KEY);

  const fields: FormFields = {
    turnstileToken: formData.get('turnstileToken') as string | undefined,
    name: formData.get('name') as string | undefined,
    email: formData.get('email') as string | undefined,
    receiver: formData.get('receiver') as string | undefined,
    subject: formData.get('subject') as string | undefined,
    message: formData.get('message') as string | undefined,
  };

  if (!fields.turnstileToken || fields.turnstileToken.length < 1) {
    return {
      message: dictionary.api.invalid_captcha,
      isError: true,
    };
  }

  const isVerified = await verifyTurnstileToken(fields.turnstileToken);
  if (!isVerified) {
    return {
      message: dictionary.api.invalid_captcha,
      isError: true,
    };
  }

  const validationError = validateFormFields(fields, dictionary);
  if (validationError) {
    return validationError;
  }

  const success = await sendFeedbackEmail({
    receiver: fields.receiver!,
    subject: fields.subject!,
    message: fields.message!,
    senderName: fields.name,
    senderEmail: fields.email,
  });

  if (success) {
    return {
      message: dictionary.api.feedback_sent,
      isError: false,
    };
  }

  return {
    message: dictionary.api.email_sending_failed,
    isError: true,
  };
}

function validateFormFields(
  fields: FormFields,
  dictionary: Dictionary,
): FormValidationResult | null {
  const { name, email, receiver, subject, message } = fields;

  if (name && !/^.{3,70}$/.test(name)) {
    return {
      message: dictionary.api.invalid_name,
      isError: true,
      field: 'name',
    };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      message: dictionary.api.invalid_email,
      isError: true,
      field: 'email',
    };
  }

  const allowedEmails = luuppiEmails.map((email) => email.email);
  if (!receiver || !allowedEmails.includes(receiver)) {
    return {
      message: dictionary.api.invalid_receiver,
      isError: true,
      field: 'receiver',
    };
  }

  if (!subject || !/^.{3,100}$/.test(subject)) {
    return {
      message: dictionary.api.invalid_subject,
      isError: true,
      field: 'subject',
    };
  }

  if (!message || message.length < 3 || message.length > 5000) {
    return {
      message: dictionary.api.invalid_message,
      isError: true,
      field: 'message',
    };
  }

  return null;
}

async function verifyTurnstileToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(CONFIG.TURNSTILE_VERIFY_ENDPOINT, {
      method: 'POST',
      body: `secret=${encodeURIComponent(CONFIG.TURNSTILE_SECRET)}&response=${encodeURIComponent(token)}`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    logger.error('Error verifying turnstile token', error);
    return false;
  }
}
