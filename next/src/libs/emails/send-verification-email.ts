import { LuuppiEmailVerify as LuuppiEmailVerifyEn } from '@/../emails/email-verify-en';
import { LuuppiEmailVerify as LuuppiEmailVerifyFi } from '@/../emails/email-verify-fi';
import { SupportedLanguage } from '@/models/locale';
import { render } from '@react-email/components';
import { logger } from '../utils/logger';
import { sendEmail } from './nodemailer';

interface SendVerificationEmailParams {
  to: string;
  name: string;
  verificationLink: string;
  subject: string;
  language: SupportedLanguage;
}

export async function sendVerificationEmail({
  to,
  name,
  verificationLink,
  subject,
  language,
}: SendVerificationEmailParams) {
  const emailHtml = await render(
    language === 'fi'
      ? LuuppiEmailVerifyFi({
          name,
          link: verificationLink,
        })
      : LuuppiEmailVerifyEn({
          name,
          link: verificationLink,
        }),
  );

  try {
    await sendEmail({
      to,
      subject,
      html: emailHtml,
    });
    logger.info('Verification email sent to:', to);
    return true;
  } catch (error) {
    logger.error('Error sending verification email:', error);
    return false;
  }
}
