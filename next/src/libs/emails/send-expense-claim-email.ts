import { LuuppiExpenseClaim } from '@/../emails/expense-claim';
import { render } from '@react-email/components';
import { ComponentProps } from 'react';
import { logger } from '../utils/logger';
import { sendEmail } from './nodemailer';

type ExpenseClaimEmailProps = ComponentProps<typeof LuuppiExpenseClaim>;

interface SendExpenseClaimEmailParams extends ExpenseClaimEmailProps {
  attachments: { filename: string; content: Uint8Array | Buffer }[];
}

export async function sendExpenseClaimEmail({
  attachments,
  ...claim
}: SendExpenseClaimEmailParams) {
  const receiver = process.env.EXPENSE_CLAIM_RECEIVER!;
  const emailHtml = await render(LuuppiExpenseClaim(claim));

  try {
    await sendEmail({
      to: receiver,
      replyTo: claim.senderEmail,
      subject: `Kulukorvaus ${claim.reference}: ${claim.senderName}, ${claim.total} €`,
      html: emailHtml,
      attachments: attachments.map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.content),
      })),
    });
    logger.info('Expense claim email sent:', claim.reference);
    return true;
  } catch (error) {
    logger.error('Error sending expense claim email:', error);
    return false;
  }
}
