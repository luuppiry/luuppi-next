'use server';
import { getDictionary } from '@/dictionaries';
import {
  expenseLimits,
  expenseReceiptTypes,
} from '@/libs/constants/expense-claim';
import { sendExpenseClaimEmail } from '@/libs/emails/send-expense-claim-email';
import { mergeReceipts, zipFiles } from '@/libs/expense-claim/receipts';
import {
  buildInvoiceCsv,
  ExpenseClaim,
  ExpenseLine,
  formatAmount,
} from '@/libs/procountor/invoice-csv';
import { isRateLimited, updateRateLimitCounter } from '@/libs/rate-limiter';
import { logger } from '@/libs/utils/logger';
import { SupportedLanguage } from '@/models/locale';
import { randomBytes } from 'node:crypto';

const options = {
  turnstileVerifyEndpoint:
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  turnstileSecret: process.env.TURNSTILE_SECRET!,
  cacheKey: 'expense-claim',
};
const log = logger.child('action:email-send-expense-claim');

const fail = (message: string, field?: string) => ({
  message,
  isError: true,
  field,
});

export async function emailSendExpenseClaim(
  lang: SupportedLanguage,
  formData: FormData,
) {
  const dictionary = await getDictionary(lang);

  const isLimited = await isRateLimited(options.cacheKey, options.cacheKey, 10);
  if (isLimited) {
    log.error('Expense claim is being rate limited');
    return fail(dictionary.api.ratelimit);
  }
  await updateRateLimitCounter(options.cacheKey, options.cacheKey);

  const turnstileToken = formData.get('turnstileToken') as string | undefined;
  if (!turnstileToken || !(await verifyTurnstileToken(turnstileToken))) {
    return fail(dictionary.api.invalid_captcha);
  }

  const text = (key: string) =>
    ((formData.get(key) as string | null) ?? '').trim();

  const name = text('name');
  const email = text('email');
  const iban = text('iban').replace(/\s+/g, '').toUpperCase();
  const purpose = text('purpose');
  const notes = text('notes');

  if (!/^.{3,70}$/.test(name)) return fail(dictionary.api.invalid_name, 'name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail(dictionary.api.invalid_email, 'email');
  }
  if (!isValidIban(iban)) return fail(dictionary.api.invalid_iban, 'iban');
  if (!/^.{3,100}$/.test(purpose)) {
    return fail(dictionary.api.invalid_purpose, 'purpose');
  }
  if (notes.length > 500) return fail(dictionary.api.invalid_message, 'notes');

  // Expense lines: ids are line-<i>-<field>; rows left completely empty are skipped
  const lines: ExpenseLine[] = [];
  for (let i = 0; i < expenseLimits.maxLines; i++) {
    const date = text(`line-${i}-date`);
    const description = text(`line-${i}-description`);
    const amount = text(`line-${i}-amount`);
    if (!date && !description && !amount) continue;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
      return fail(dictionary.api.invalid_expense_date, `line-${i}-date`);
    }
    if (!/^.{3,80}$/.test(description)) {
      return fail(
        dictionary.api.invalid_expense_description,
        `line-${i}-description`,
      );
    }
    if (!/^\d{1,6}([.,]\d{1,2})?$/.test(amount)) {
      return fail(dictionary.api.invalid_expense_amount, `line-${i}-amount`);
    }
    const amountCents = Math.round(Number(amount.replace(',', '.')) * 100);
    if (amountCents <= 0) {
      return fail(dictionary.api.invalid_expense_amount, `line-${i}-amount`);
    }

    lines.push({ date, description, amountCents });
  }
  if (lines.length === 0) {
    return fail(dictionary.api.invalid_expense_amount, 'line-0-amount');
  }

  const files = (formData.getAll('receipts') as File[]).filter(
    (f) => f.size > 0,
  );
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  if (
    files.length < 1 ||
    files.length > expenseLimits.maxFiles ||
    totalBytes > expenseLimits.maxTotalBytes ||
    files.some(
      (f) =>
        f.size > expenseLimits.maxFileBytes ||
        !(expenseReceiptTypes as readonly string[]).includes(f.type),
    )
  ) {
    return fail(dictionary.api.invalid_receipts, 'receipts');
  }

  let receiptsPdf: Uint8Array;
  try {
    receiptsPdf = await mergeReceipts(files);
  } catch (error) {
    log.error('Error merging expense claim receipts', error);
    return fail(dictionary.api.invalid_receipts, 'receipts');
  }

  // Helsinki-local date, so the invoice date doesn't flip around midnight UTC
  const todayIso = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Helsinki',
  }).format(new Date());
  const reference = `EK-${todayIso.replace(/-/g, '')}-${randomBytes(2).toString('hex').toUpperCase()}`;
  const claim: ExpenseClaim = {
    reference,
    name,
    email,
    iban,
    purpose,
    notes,
    lines,
    attachmentName: `${reference}.pdf`,
  };

  // The CSV is a convenience: if it fails the claim still goes out without it
  const attachments: { filename: string; content: Uint8Array | Buffer }[] = [
    { filename: `${reference}-receipts.pdf`, content: receiptsPdf },
  ];
  let csvIncluded = false;
  try {
    const csv = buildInvoiceCsv(claim, todayIso);
    const zip = await zipFiles([
      { name: `${reference}.csv`, data: csv },
      { name: claim.attachmentName, data: receiptsPdf },
    ]);
    attachments.push({ filename: `${reference}-procountor.zip`, content: zip });
    csvIncluded = true;
  } catch (error) {
    log.error('Error building Procountor CSV for expense claim', error);
  }

  const total = lines.reduce((sum, l) => sum + l.amountCents, 0);
  const success = await sendExpenseClaimEmail({
    reference,
    senderName: name,
    senderEmail: email,
    iban,
    purpose,
    notes,
    lines: lines.map((l) => ({
      date: l.date,
      description: l.description,
      amount: formatAmount(l.amountCents),
    })),
    total: formatAmount(total),
    csvIncluded,
    attachments,
  });

  if (success) {
    return { message: dictionary.api.expense_claim_sent, isError: false };
  }
  return fail(dictionary.api.email_sending_failed);
}

function isValidIban(iban: string): boolean {
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  const moved = iban.slice(4) + iban.slice(0, 4);
  const digits = moved.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let remainder = 0;
  for (const ch of digits) remainder = (remainder * 10 + Number(ch)) % 97;
  return remainder === 1;
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
    log.error('Error verifying turnstile token', error);
    return false;
  }
}
