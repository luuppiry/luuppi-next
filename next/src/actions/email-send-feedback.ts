'use server';
import { LuuppiFeedback } from '@/../emails/feedback';
import { getDictionary } from '@/dictionaries';
import { luuppiEmails } from '@/libs/constants/emails';
import { isRateLimited, updateRateLimitCounter } from '@/libs/rate-limiter';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { EmailClient, EmailMessage } from '@azure/communication-email';
import { render } from '@react-email/components';

const options = {
  senderAddress: process.env.AZURE_COMMUNICATION_SERVICE_SENDER_EMAIL!,
  turnstileVerifyEndpoint:
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  turnstileSecret: process.env.TURNSTILE_SECRET!,
  cacheKey: 'feedback',
  connectionString: process.env.AZURE_COMMUNICATION_SERVICE_CONNECTION_STRING!,
};

export async function emailSendFeedback(
  lang: SupportedLanguage,
  formData: FormData,
) {
  const dictionary = await getDictionary(lang);

  const isLimited = await isRateLimited(options.cacheKey, options.cacheKey, 10);
  if (isLimited) {
    logger.error('Feedback is being rate limited');
    return {
      message: dictionary.api.ratelimit,
      isError: true,
    };
  } else {
    await updateRateLimitCounter(options.cacheKey, options.cacheKey);
  }

  const turnstileToken = formData.get('turnstileToken') as string | undefined;
  const name = formData.get('name') as string | undefined;
  const email = formData.get('email') as string | undefined;
  const receiver = formData.get('receiver') as string | undefined;
  const subject = formData.get('subject') as string | undefined;
  const message = formData.get('message') as string | undefined;

  if (!turnstileToken || turnstileToken.length < 1) {
    return {
      message: dictionary.api.invalid_captcha,
      isError: true,
    };
  }

  const isVerified = await verifyTurnstileToken(turnstileToken);
  if (!isVerified) {
    return {
      message: dictionary.api.invalid_captcha,
      isError: true,
    };
  }

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
  if (
    !receiver ||
    !allowedEmails.find((allowedEmail) => allowedEmail === receiver)
  ) {
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

  if (!message || !/^.{3,5000}$/.test(message)) {
    return {
      message: dictionary.api.invalid_message,
      isError: true,
      field: 'message',
    };
  }

  const emailHtml = render(
    LuuppiFeedback({
      message,
      receiver,
      senderEmail: !email || email === '' ? '<ei sähköpostia>' : email,
      senderName: !name || name === '' ? '<anonyymi lähettäjä>' : name,
      subject,
    }),
  );

  const emailMessage: EmailMessage = {
    senderAddress: options.senderAddress,
    content: {
      subject: 'Palautetta vastaanotettu',
      html: emailHtml,
    },
    recipients: {
      to: [
        {
          address: receiver,
        },
      ],
    },
  };

  try {
    const emailClient = new EmailClient(options.connectionString);
    const poller = await emailClient.beginSend(emailMessage);
    await poller.pollUntilDone();
    logger.info('Feedback email sent', email);
    return {
      message: dictionary.api.feedback_sent,
      isError: false,
    };
  } catch (error) {
    logger.error('Error sending feedback email', error);
    return {
      message: dictionary.api.email_sending_failed,
      isError: true,
    };
  }
}

async function verifyTurnstileToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(options.turnstileVerifyEndpoint, {
      method: 'POST',
      body: `secret=${encodeURIComponent(options.turnstileSecret)}&response=${encodeURIComponent(token)}`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await res.json();

    return data.success;
  } catch (error) {
    logger.error('Error verifying turnstile token', error);
    return false;
  }
}
