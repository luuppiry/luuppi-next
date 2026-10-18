/* eslint-disable no-control-regex */
/* eslint-disable quotes */
import {
  expenseCategories,
  expenseLimits,
} from '@/libs/constants/expense-claim';

// FIXME: confirm with a test import in Procountor's import preview
const DECIMAL_SEPARATOR = ',';
const MEMBER_INVOICE_TYPE = 'T'; // travel invoice (fallback: 'O' purchase invoice)
const ASSOCIATION_INVOICE_TYPE = 'O'; // purchase invoice
const RECORD_WIDTH = 44; // invoice record fields 1-44 (45-47 are journal receipts only)

export interface ExpenseLine {
  date: string;
  description: string;
  amountCents: number;
  vat: string;
  category: string;
}

export interface ExpenseClaim {
  reference: string;
  name: string;
  email: string;
  iban: string;
  organization: string;
  businessId: string;
  theirInvoiceNumber: string;
  purpose: string;
  notes: string;
  lines: ExpenseLine[];
  attachmentName: string;
}

export const formatDate = (iso: string) => iso.split('-').reverse().join('.');

export const formatAmount = (cents: number) =>
  (cents / 100).toFixed(2).replace('.', DECIMAL_SEPARATOR);

// The import format has no quoting: semicolons, quotes and line breaks would break
// the record. Leading =+-@ are dropped in case someone opens the file in Excel.
const clean = (value: string, max: number) =>
  value
    .replace(/[;"\\\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[=+\-@]+/, '')
    .slice(0, max);

const record = (cells: Record<number, string>) =>
  Array.from({ length: RECORD_WIDTH }, (_, i) => cells[i + 1] ?? '').join(';');

// The file is not UTF-8 (the template contains Windows-1252 bytes), so encode
// as Latin-1 and replace anything it can't represent. No header row, no BOM.
const encode = (csv: string) =>
  Buffer.from(
    csv.replace(/[\u2018\u2019]/g, "'").replace(/[^\u0000-\u00ff]/g, '?'),
    'latin1',
  );

export function buildInvoiceCsv(claim: ExpenseClaim, todayIso: string): Buffer {
  const isAssociation = Boolean(claim.organization);
  const total = claim.lines.reduce((sum, l) => sum + l.amountCents, 0);

  const invoice = record({
    1: isAssociation ? ASSOCIATION_INVOICE_TYPE : MEMBER_INVOICE_TYPE,
    2: 'EUR',
    4: claim.iban,
    5: clean(claim.businessId, 40),
    7: clean(isAssociation ? claim.organization : claim.name, 80),
    10: 't', // amounts are gross
    13: formatDate(todayIso),
    20: clean(
      `${claim.purpose}. Ref ${claim.reference}. Claimant ${claim.name}, ${claim.email}. ${claim.notes}`,
      500,
    ),
    24: formatAmount(total),
    29: 't', // accounting by rows
    34: claim.attachmentName,
    39: clean(claim.theirInvoiceNumber || claim.reference, 80),
  });

  const rows = claim.lines.map((l) =>
    record({
      2: clean(l.description, 80),
      4: '1',
      6: formatAmount(l.amountCents),
      8: l.vat.replace('.', DECIMAL_SEPARATOR),
      9: formatDate(l.date),
      14: expenseCategories.find((c) => c.key === l.category)?.account ?? '',
    }),
  );

  const buffer = encode([invoice, ...rows].join('\r\n') + '\r\n');
  if (buffer.length > expenseLimits.maxCsvBytes) {
    throw new Error('Generated CSV is too large');
  }
  return buffer;
}
