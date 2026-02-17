import nodemailer, { SendMailOptions } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { logger } from '../utils/logger';

interface EmailOptions extends SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'postfix',
  port: Number(process.env.SMTP_PORT) || 25,
  secure: process.env.SMTP_SECURE === 'true' || false,
  ignoreTLS: process.env.SMTP_IGNORE_TLS === 'true' || true,
} as SMTPTransport.Options);

const defaults = {
  from: {
    name: process.env.SMTP_FROM_NAME || 'Luuppi',
    address: process.env.SMTP_FROM_ADDRESS || 'notifications@luuppi.fi',
  },
} as const;

/**
 * Sends an email using nodemailer
 * @param options Email configuration options
 * @throws {EmailError} If the email fails to send
 * @returns Promise with the sending info
 */
export async function sendEmail(options: EmailOptions) {
  if (!options.to || !options.subject) {
    throw new Error('Missing required email fields');
  }

  try {
    const mailOptions: EmailOptions = {
      ...defaults,
      ...options,
    };

    const info = await transporter.sendMail(mailOptions);

    if (info.rejected.length > 0) {
      throw new Error('Email rejected');
    }

    logger.info('Email sent:', info.messageId);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw new Error('Error sending email', { cause: error });
  }
}
