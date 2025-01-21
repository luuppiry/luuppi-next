import { LuuppiFeedback } from '@/../emails/feedback';
import { render } from '@react-email/components';
import { logger } from '../utils/logger';
import { sendEmail } from './nodemailer';

interface SendFeedbackEmailParams {
  receiver: string;
  subject: string;
  message: string;
  senderName?: string;
  senderEmail?: string;
}

export async function sendFeedbackEmail({
  receiver,
  subject,
  message,
  senderName,
  senderEmail,
}: SendFeedbackEmailParams) {
  const emailHtml = await render(
    LuuppiFeedback({
      message,
      receiver,
      senderEmail: !senderEmail ? '<ei sähköpostia>' : senderEmail,
      senderName: !senderName ? '<anonyymi lähettäjä>' : senderName,
      subject,
    }),
  );

  try {
    await sendEmail({
      to: receiver,
      subject,
      html: emailHtml,
    });
    logger.info('Feedback email sent to:', receiver);
    return true;
  } catch (error) {
    logger.error('Error sending feedback email:', error);
    return false;
  }
}
